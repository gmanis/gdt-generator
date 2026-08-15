import { NhlLeagueProvider } from "./leagues";
import { collectRefs, AppRefs } from "./refs";
import { state } from "./state";
import { renderLineupSlots, parseProjectedLines, applyDailyFaceoffLines, syncLineupUI } from "./lineup";
import { generateThread, saveCurrentTemplate, DEFAULT_TEMPLATES } from "./generate";
import { CacheManager } from "./cache";
import { MOCK_QUOTES } from "./mockData";
import { Quote, NewsItem } from "./types";
import { showToast, showLoading, hideLoading, openModal, closeModal } from "./ui";
import { NHL_TEAMS } from "./teams";
import { fetchTweetEmbed, isTweetUrl } from "./tweets";
import { TEMPLATE_PLACEHOLDERS } from "./templates";
import { fetchDailyFaceoffLines } from "./dailyfaceoff";

const provider = new NhlLeagueProvider();

// Demo mode always browses this fixed date so the mock schedule resolves.
const DEMO_DATE = "2026-03-10";

function dateForMode(demoMode: boolean): string {
  return demoMode ? DEMO_DATE : new Date().toISOString().split("T")[0];
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function loadSettings(refs: AppRefs): void {
  const savedProxy = localStorage.getItem("gtg_settings_cors_proxy");
  refs.corsProxyInput.value = savedProxy ?? "/api/nhl-proxy?url=";

  if (!localStorage.getItem("gtg_settings_templates")) {
    localStorage.setItem("gtg_settings_templates", JSON.stringify(DEFAULT_TEMPLATES));
  }

  const savedStyle = localStorage.getItem("gtg_settings_current_template") ?? "bbcode";
  refs.templateStyleSelect.value = savedStyle;
  loadTemplateForStyle(refs);

  // Demo mode — persisted, off by default
  const savedDemoMode = localStorage.getItem("gtg_settings_demo_mode") === "true";
  refs.demoModeToggle.checked = savedDemoMode;
  state.demoMode = savedDemoMode;

  // Favorite team
  NHL_TEAMS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.abbrev;
    opt.textContent = t.name;
    refs.favoriteTeamSelect.appendChild(opt);
  });
  const savedFavorite = localStorage.getItem("gtg_settings_favorite_team") ?? "NYR";
  refs.favoriteTeamSelect.value = savedFavorite;
  state.favoriteTeam = savedFavorite;
}

function loadTemplateForStyle(refs: AppRefs): void {
  const style = refs.templateStyleSelect.value;
  localStorage.setItem("gtg_settings_current_template", style);
  const saved = localStorage.getItem("gtg_settings_templates");
  refs.templateBodyEditor.value = saved
    ? (JSON.parse(saved)[style] ?? DEFAULT_TEMPLATES[style])
    : DEFAULT_TEMPLATES[style];
}

function saveSettings(refs: AppRefs): void {
  localStorage.setItem("gtg_settings_cors_proxy", refs.corsProxyInput.value.trim());
  showToast(refs, "Settings saved!");
  closeModal(refs.settingsModal);
}

function resetTemplate(refs: AppRefs): void {
  const style = refs.templateStyleSelect.value;
  if (!confirm(`Reset the ${style} template to default?`)) return;
  refs.templateBodyEditor.value = DEFAULT_TEMPLATES[style];
  const saved = localStorage.getItem("gtg_settings_templates");
  const templates = saved ? JSON.parse(saved) : {};
  templates[style] = DEFAULT_TEMPLATES[style];
  localStorage.setItem("gtg_settings_templates", JSON.stringify(templates));
  showToast(refs, "Template reset!");
}

/** Renders the {{placeholder}} reference chips; clicking one inserts it at the cursor. */
function renderPlaceholderList(refs: AppRefs): void {
  refs.placeholderList.innerHTML = "";
  TEMPLATE_PLACEHOLDERS.forEach(p => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "placeholder-chip";
    chip.textContent = `{{${p.key}}}`;
    chip.title = p.description;
    chip.addEventListener("click", () => insertPlaceholder(refs, p.key));
    refs.placeholderList.appendChild(chip);
  });
}

function insertPlaceholder(refs: AppRefs, key: string): void {
  const editor = refs.templateBodyEditor;
  const token  = `{{${key}}}`;
  const start  = editor.selectionStart ?? editor.value.length;
  const end    = editor.selectionEnd ?? editor.value.length;

  editor.value = editor.value.slice(0, start) + token + editor.value.slice(end);
  editor.focus();
  editor.selectionStart = editor.selectionEnd = start + token.length;
}

function refreshCacheStats(refs: AppRefs): void {
  const { count, bytes } = CacheManager.getCacheStats();
  refs.cacheStatsText.textContent = `${count} items cached (${(bytes / 1024).toFixed(1)} KB)`;
}

function clearCache(refs: AppRefs): void {
  CacheManager.clear();
  refreshCacheStats(refs);
  showToast(refs, "Cache cleared!");
}

// ─── Team display helpers ─────────────────────────────────────────────────────

function clearGameDetails(refs: AppRefs): void {
  refs.awayTeamName.textContent = "Away Team";
  refs.homeTeamName.textContent = "Home Team";
  refs.awayTeamLogo.style.display = "none";
  refs.homeTeamLogo.style.display = "none";
  refs.awayNewsContainer.innerHTML = `<p class="no-data">No news loaded</p>`;
  refs.homeNewsContainer.innerHTML = `<p class="no-data">No news loaded</p>`;
  refs.awayLineupSlots.innerHTML = "";
  refs.homeLineupSlots.innerHTML = "";
}

// ─── Data loading ─────────────────────────────────────────────────────────────

async function loadGamesList(refs: AppRefs): Promise<void> {
  showLoading(refs, "Loading schedule…");
  try {
    state.games = await provider.fetchGames(state.currentDate, state.demoMode);
    refs.gameSelect.innerHTML = "";

    if (state.games.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "-- No games scheduled --";
      refs.gameSelect.appendChild(opt);
      state.selectedGame = null;
      refs.openImportModalBtn.style.display = "none";
      clearGameDetails(refs);
    } else {
      const favoriteIdx = state.favoriteTeam
        ? state.games.findIndex(g => g.awayTeam.abbrev === state.favoriteTeam || g.homeTeam.abbrev === state.favoriteTeam)
        : -1;
      const selectedIdx = favoriteIdx >= 0 ? favoriteIdx : 0;

      state.games.forEach((game, idx) => {
        const opt = document.createElement("option");
        opt.value = String(game.id);
        opt.textContent = `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev} (${game.venue})`;
        if (idx === selectedIdx) opt.selected = true;
        refs.gameSelect.appendChild(opt);
      });
      state.selectedGame = state.games[selectedIdx];
      refs.openImportModalBtn.style.display = "block";
      await loadSelectedGameDetails(refs);
    }
  } catch (e) {
    console.error(e);
    showToast(refs, "Error loading schedule!");
  } finally {
    hideLoading(refs);
    refreshCacheStats(refs);
  }
}

/**
 * Fetches DailyFaceoff lines for one team and applies them, syncing the
 * lineup dropdowns and the (possibly hidden, if the import modal isn't open)
 * status line. Shared by the manual "Fetch from DailyFaceoff" button and the
 * automatic fetch that runs whenever a game is selected.
 */
async function fetchAndApplyDailyFaceoffLines(
  refs: AppRefs,
  team: "away" | "home",
  teamAbbrev: string,
): Promise<{ fLines: number; dPairs: number; goalies: number }> {
  const lines = await fetchDailyFaceoffLines(teamAbbrev, state.demoMode);
  const counts = applyDailyFaceoffLines(lines, team, state);
  const container = team === "away" ? refs.awayLineupSlots : refs.homeLineupSlots;
  syncLineupUI(container, state.lineups[team]);
  refs.dailyFaceoffStatus.textContent = `${lines.sourceName} · updated ${new Date(lines.updatedAt).toLocaleDateString()}`;
  return counts;
}

/** Best-effort auto-fetch: falls back silently to the roster-order auto-fill on failure. */
async function autoFetchDailyFaceoffLines(refs: AppRefs, team: "away" | "home", teamAbbrev: string): Promise<void> {
  try {
    await fetchAndApplyDailyFaceoffLines(refs, team, teamAbbrev);
  } catch (e) {
    console.warn(`DailyFaceoff auto-fetch failed for ${teamAbbrev}:`, e);
  }
}

async function loadSelectedGameDetails(refs: AppRefs): Promise<void> {
  if (!state.selectedGame) return;
  const game = state.selectedGame;

  refs.awayTeamName.textContent = `${game.awayTeam.placeName} ${game.awayTeam.commonName}`;
  refs.homeTeamName.textContent = `${game.homeTeam.placeName} ${game.homeTeam.commonName}`;
  refs.awayNewsTitle.textContent = `${game.awayTeam.abbrev} News`;
  refs.homeNewsTitle.textContent = `${game.homeTeam.abbrev} News`;

  const setLogo = (el: HTMLImageElement, url?: string) => {
    el.style.display = url ? "block" : "none";
    if (url) el.src = url;
  };
  setLogo(refs.awayTeamLogo, game.awayTeam.logo);
  setLogo(refs.homeTeamLogo, game.homeTeam.logo);

  try {
    const [rosterAway, rosterHome] = await Promise.all([
      provider.fetchTeamRoster(game.awayTeam.abbrev, state.demoMode),
      provider.fetchTeamRoster(game.homeTeam.abbrev, state.demoMode),
    ]);
    state.rosters.away = rosterAway;
    state.rosters.home = rosterHome;
    renderLineupSlots("away", rosterAway, refs.awayLineupSlots, state);
    renderLineupSlots("home", rosterHome, refs.homeLineupSlots, state);

    // Best-effort: auto-populate projected lines from DailyFaceoff for both
    // teams, falling back to the roster-order auto-fill above if it fails.
    await Promise.all([
      autoFetchDailyFaceoffLines(refs, "away", game.awayTeam.abbrev),
      autoFetchDailyFaceoffLines(refs, "home", game.homeTeam.abbrev),
    ]);

    state.standings = await provider.fetchStandings(state.demoMode);

    const [statsAway, statsHome] = await Promise.all([
      provider.fetchTeamStats(game.awayTeam.abbrev, state.standings, state.demoMode),
      provider.fetchTeamStats(game.homeTeam.abbrev, state.standings, state.demoMode),
    ]);
    state.stats.away = statsAway;
    state.stats.home = statsHome;

    const [newsAway, newsHome] = await Promise.all([
      provider.fetchTeamNews(game.awayTeam.abbrev, state.demoMode),
      provider.fetchTeamNews(game.homeTeam.abbrev, state.demoMode),
    ]);
    renderNews(refs, "away", newsAway);
    renderNews(refs, "home", newsHome);
  } catch (e) {
    console.error("Error loading game details:", e);
    showToast(refs, "Failed loading rosters or standings!");
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

function renderNews(refs: AppRefs, team: "away" | "home", news: NewsItem[]): void {
  const container = team === "away" ? refs.awayNewsContainer : refs.homeNewsContainer;
  container.innerHTML = "";

  if (news.length === 0) {
    container.innerHTML = `<p class="no-data">No news found</p>`;
    return;
  }

  news.forEach(item => {
    const card = document.createElement("div");
    card.className = "news-item";

    const h4 = document.createElement("h4");
    h4.textContent = item.headline;
    card.appendChild(h4);

    const p = document.createElement("p");
    p.textContent = item.description ?? "No summary available.";
    card.appendChild(p);

    card.addEventListener("click", () => {
      refs.quoteAuthorInput.value = item.byline ?? "ESPN News";
      refs.quoteTextInput.value   = item.description ?? item.headline;
      showToast(refs, "Copied to Quote Creator!");
      refs.quoteAuthorInput.scrollIntoView({ behavior: "smooth" });
    });

    container.appendChild(card);
  });
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

function loadQuotes(refs: AppRefs): void {
  state.quotes = state.demoMode
    ? [...MOCK_QUOTES]
    : JSON.parse(localStorage.getItem("gtg_quotes") ?? "[]");
  renderQuotesList(refs);
}

function saveQuotes(): void {
  localStorage.setItem("gtg_quotes", JSON.stringify(state.quotes));
}

function addQuote(refs: AppRefs): void {
  const author = refs.quoteAuthorInput.value.trim();
  const text   = refs.quoteTextInput.value.trim();
  if (!author || !text) { showToast(refs, "Fill in both Author and Quote fields!"); return; }

  const quote: Quote = {
    id:         crypto.randomUUID(),
    author,
    role:       "",
    text,
    teamAbbrev: state.selectedGame?.awayTeam.abbrev ?? "",
  };
  state.quotes.push(quote);
  saveQuotes();
  renderQuotesList(refs);
  refs.quoteTextInput.value = "";
  showToast(refs, "Quote added!");
}

function deleteQuote(refs: AppRefs, id: string): void {
  state.quotes = state.quotes.filter(q => q.id !== id);
  saveQuotes();
  renderQuotesList(refs);
  showToast(refs, "Quote deleted!");
}

function renderQuotesList(refs: AppRefs): void {
  refs.quotesListContainer.innerHTML = "";

  if (state.quotes.length === 0) {
    refs.quotesListContainer.innerHTML = `<p class="no-data" style="text-align:center">No quotes yet</p>`;
    return;
  }

  state.quotes.forEach(q => {
    const item = document.createElement("div");
    item.className = "quote-item";

    const body = document.createElement("div");
    body.className = "quote-content";
    body.textContent = `"${q.text}"`;

    const cite = document.createElement("cite");
    cite.textContent = `— ${q.author}${q.teamAbbrev ? ` (${q.teamAbbrev})` : ""}`;
    body.appendChild(cite);

    const del = document.createElement("button");
    del.className = "delete-quote-btn";
    del.innerHTML = "&times;";
    del.title = "Delete Quote";
    del.addEventListener("click", () => deleteQuote(refs, q.id));

    item.appendChild(body);
    item.appendChild(del);
    refs.quotesListContainer.appendChild(item);
  });
}

// ─── Media Tweets ─────────────────────────────────────────────────────────────

function loadTweets(): void {
  state.selectedTweets = JSON.parse(localStorage.getItem("gtg_tweets") ?? "[]");
}

function saveTweets(): void {
  localStorage.setItem("gtg_tweets", JSON.stringify(state.selectedTweets));
}

async function addTweet(refs: AppRefs, url: string): Promise<void> {
  if (state.selectedTweets.some(t => t.url === url)) { showToast(refs, "Already added!"); return; }

  showLoading(refs, "Fetching tweet…");
  try {
    const embed = await fetchTweetEmbed(url, state.demoMode);
    state.selectedTweets.push(embed);
    saveTweets();
    renderSelectedTweets(refs);
    showToast(refs, "Tweet added!");
  } catch (e) {
    console.error("fetchTweetEmbed error:", e);
    showToast(refs, "Couldn't fetch that tweet — check the URL.");
  } finally {
    hideLoading(refs);
  }
}

function removeTweet(refs: AppRefs, url: string): void {
  state.selectedTweets = state.selectedTweets.filter(t => t.url !== url);
  saveTweets();
  renderSelectedTweets(refs);
  showToast(refs, "Tweet removed!");
}

function renderSelectedTweets(refs: AppRefs): void {
  refs.selectedTweetsContainer.innerHTML = "";

  if (state.selectedTweets.length === 0) {
    refs.selectedTweetsContainer.innerHTML = `<p class="no-data" style="text-align:center">No tweets selected</p>`;
    return;
  }

  state.selectedTweets.forEach(t => {
    const item = document.createElement("div");
    item.className = "quote-item";

    const body = document.createElement("div");
    body.className = "quote-content";
    body.textContent = `"${t.text}"`;

    const cite = document.createElement("cite");
    cite.textContent = `— ${t.authorName}`;
    body.appendChild(cite);

    const del = document.createElement("button");
    del.className = "delete-quote-btn";
    del.innerHTML = "&times;";
    del.title = "Remove Tweet";
    del.addEventListener("click", () => removeTweet(refs, t.url));

    item.appendChild(body);
    item.appendChild(del);
    refs.selectedTweetsContainer.appendChild(item);
  });
}

// ─── App bootstrap ────────────────────────────────────────────────────────────

function init(): void {
  const refs = collectRefs();

  // Settings (loadSettings sets state.demoMode/state.favoriteTeam from localStorage)
  loadSettings(refs);
  refreshCacheStats(refs);
  renderPlaceholderList(refs);

  // Initial date depends on the persisted demo-mode setting
  const initialDate = dateForMode(state.demoMode);
  refs.datePicker.value = initialDate;
  state.currentDate     = initialDate;

  // Load quotes and previously-selected tweets
  loadQuotes(refs);
  loadTweets();
  renderSelectedTweets(refs);

  // ── Event listeners ──────────────────────────────────────────────────────

  // Demo mode (in Settings)
  refs.demoModeToggle.addEventListener("change", async () => {
    state.demoMode = refs.demoModeToggle.checked;
    localStorage.setItem("gtg_settings_demo_mode", String(state.demoMode));
    const date = dateForMode(state.demoMode);
    refs.datePicker.value = date;
    state.currentDate     = date;
    loadQuotes(refs);
    await loadGamesList(refs);
  });

  // Favorite team (in Settings)
  refs.favoriteTeamSelect.addEventListener("change", () => {
    state.favoriteTeam = refs.favoriteTeamSelect.value;
    localStorage.setItem("gtg_settings_favorite_team", state.favoriteTeam);
  });

  // Date picker
  refs.datePicker.addEventListener("change", async () => {
    state.currentDate = refs.datePicker.value;
    await loadGamesList(refs);
  });

  // Game selector
  refs.gameSelect.addEventListener("change", async () => {
    const id   = parseInt(refs.gameSelect.value, 10);
    const game = state.games.find(g => g.id === id);
    if (!game) return;
    state.selectedGame = game;
    showLoading(refs, "Loading game data…");
    try { await loadSelectedGameDetails(refs); }
    finally { hideLoading(refs); }
  });

  // Modals
  refs.openSettingsBtn.addEventListener("click",   () => openModal(refs.settingsModal));
  refs.closeSettingsModal.addEventListener("click",() => closeModal(refs.settingsModal));
  refs.openImportModalBtn.addEventListener("click",() => {
    refs.dailyFaceoffStatus.textContent = "";
    openModal(refs.importModal);
  });
  refs.closeImportModal.addEventListener("click",  () => closeModal(refs.importModal));

  // Settings actions
  refs.saveSettingsBtn.addEventListener("click", () => saveSettings(refs));
  refs.clearCacheBtn.addEventListener("click",   () => clearCache(refs));

  // Template
  refs.templateStyleSelect.addEventListener("change", () => loadTemplateForStyle(refs));
  refs.resetTemplateBtn.addEventListener("click",     () => resetTemplate(refs));
  refs.saveTemplateBtn.addEventListener("click",      () => {
    saveCurrentTemplate(refs);
    showToast(refs, "Template saved!");
  });

  // Scratches
  refs.awayScratchesInput.addEventListener("input", e => {
    state.lineups.away.scratches = (e.target as HTMLInputElement).value
      .split(",").map(s => s.trim()).filter(Boolean);
  });
  refs.homeScratchesInput.addEventListener("input", e => {
    state.lineups.home.scratches = (e.target as HTMLInputElement).value
      .split(",").map(s => s.trim()).filter(Boolean);
  });

  // Quotes
  refs.addQuoteBtn.addEventListener("click", () => addQuote(refs));

  // Media tweets
  refs.addTweetUrlBtn.addEventListener("click", () => {
    const url = refs.tweetUrlInput.value.trim();
    if (!url) { showToast(refs, "Paste a tweet URL first!"); return; }
    if (!isTweetUrl(url)) { showToast(refs, "That doesn't look like a tweet URL."); return; }
    addTweet(refs, url);
    refs.tweetUrlInput.value = "";
  });

  // Lineup paste import
  refs.parseLineupBtn.addEventListener("click", () => {
    const rawText = refs.quickPasteTextarea.value.trim();
    const team    = refs.importTeamSelect.value as "away" | "home";
    if (!rawText) { showToast(refs, "Paste projected lines first!"); return; }

    const { fLines, dPairs, goalies } = parseProjectedLines(rawText, team, state);
    const container = team === "away" ? refs.awayLineupSlots : refs.homeLineupSlots;
    syncLineupUI(container, state.lineups[team]);
    showToast(refs, `Imported ${fLines} F lines, ${dPairs} D pairs, ${goalies} goalies!`);
    closeModal(refs.importModal);
  });

  // Lineup fetch from DailyFaceoff
  refs.fetchDailyFaceoffBtn.addEventListener("click", async () => {
    const team = refs.importTeamSelect.value as "away" | "home";
    const teamAbbrev = team === "away" ? state.selectedGame?.awayTeam.abbrev : state.selectedGame?.homeTeam.abbrev;
    if (!teamAbbrev) { showToast(refs, "Select a game first!"); return; }

    refs.dailyFaceoffStatus.textContent = "Fetching…";
    try {
      const { fLines, dPairs, goalies } = await fetchAndApplyDailyFaceoffLines(refs, team, teamAbbrev);
      showToast(refs, `Fetched ${fLines} F lines, ${dPairs} D pairs, ${goalies} goalies from DailyFaceoff!`);
      closeModal(refs.importModal);
    } catch (e) {
      console.error("fetchDailyFaceoffLines error:", e);
      refs.dailyFaceoffStatus.textContent = (e as Error).message;
    }
  });

  // Generate + copy
  refs.generateThreadBtn.addEventListener("click",  () => generateThread(refs, state));
  refs.copyToClipboardBtn.addEventListener("click", () => {
    const text = refs.outputContainer.textContent ?? "";
    if (!text) { showToast(refs, "Generate a thread first!"); return; }
    navigator.clipboard.writeText(text)
      .then(() => showToast(refs, "Copied to clipboard!"))
      .catch(() => showToast(refs, "Copy failed — copy manually from the box."));
  });

  // Tab switcher
  document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab") ?? "editor";
      document.querySelectorAll<HTMLElement>(".tab-content").forEach(el => {
        el.style.display = "none";
      });
      const panel = document.getElementById(`tabContent_${tab}`);
      if (panel) panel.style.display = tab === "editor" ? "flex" : "block";
    });
  });

  // Kick off initial data load
  loadGamesList(refs);
}

window.addEventListener("DOMContentLoaded", init);
