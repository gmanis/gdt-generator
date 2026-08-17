import { AppRefs } from "./refs";
import { AppState } from "./state";
import { BbCodeRenderer, MarkdownRenderer, HtmlRenderer, FormatRenderer, HeadshotMap } from "./renderers";
import { DEFAULT_TEMPLATES, TemplateEngine } from "./templates";
import { Roster } from "./types";
import { resolveStartingGoalie, StartingGoalieInfo } from "./goalieCompare";
import { showToast } from "./ui";

// ─── Headshot lookup ──────────────────────────────────────────────────────────

function buildHeadshotMap(roster: Roster): HeadshotMap {
  const map: HeadshotMap = {};
  [...roster.forwards, ...roster.defensemen, ...roster.goalies].forEach(p => {
    if (p.headshot) map[`${p.firstName} ${p.lastName}`] = p.headshot;
  });
  return map;
}

// ─── Renderer factory ─────────────────────────────────────────────────────────

function getRenderer(style: string): FormatRenderer {
  if (style === "markdown") return new MarkdownRenderer();
  if (style === "html")     return new HtmlRenderer();
  return new BbCodeRenderer();
}

// ─── Template values builder ──────────────────────────────────────────────────

function formatGoalieStat(g: StartingGoalieInfo, pick: (s: NonNullable<StartingGoalieInfo["stats"]>) => string): string {
  return g.stats ? pick(g.stats) : "N/A";
}

function buildValues(state: AppState, renderer: FormatRenderer): Record<string, string> {
  const { selectedGame: game, standings, stats, lastFive, lineups, quotes, rosters } = state;
  if (!game) return {};

  const values: Record<string, string> = {};

  // Teams
  values["away_team"]   = `${game.awayTeam.placeName} ${game.awayTeam.commonName}`;
  values["home_team"]   = `${game.homeTeam.placeName} ${game.homeTeam.commonName}`;
  values["away_abbrev"] = game.awayTeam.abbrev;
  values["home_abbrev"] = game.homeTeam.abbrev;
  values["venue"]       = game.venue;

  // Date / Time
  const localDate = new Date(game.startTimeUTC);
  values["game_date"] = localDate.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  values["game_time"] = localDate.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });

  // Broadcasts
  values["tv_broadcasts"] = game.tvBroadcasts.length > 0
    ? game.tvBroadcasts.map(b => b.network).join(", ")
    : "TBD";

  // Standings (division of the home team)
  const homeEntry = standings.find(t => t.teamAbbrev === game.homeTeam.abbrev);
  const divName   = homeEntry?.divisionName ?? "";
  const divRows   = standings
    .filter(t => t.divisionName === divName)
    .sort((a, b) => b.points - a.points)
    .map(t => [
      t.teamAbbrev,
      String(t.gamesPlayed),
      String(t.wins),
      String(t.losses),
      String(t.otLosses),
      String(t.points),
      (t.goalDifferential > 0 ? "+" : "") + t.goalDifferential,
      `${t.streakCode}${t.streakCount}`,
    ]);
  values["standings_table"] = renderer.renderTable(
    ["Team", "GP", "W", "L", "OTL", "PTS", "DIFF", "STREAK"],
    divRows,
  );

  // Team comparison
  const { home: hSt, away: aSt } = stats;
  if (hSt && aSt) {
    const compRows = [
      ["Record",     `${aSt.wins}-${aSt.losses}-${aSt.otLosses}`,                  `${hSt.wins}-${hSt.losses}-${hSt.otLosses}`],
      ["Points",     String(aSt.points),                                             String(hSt.points)],
      ["GF / Game",  (aSt.goalsFor     / aSt.gamesPlayed).toFixed(2),               (hSt.goalsFor     / hSt.gamesPlayed).toFixed(2)],
      ["GA / Game",  (aSt.goalsAgainst / aSt.gamesPlayed).toFixed(2),               (hSt.goalsAgainst / hSt.gamesPlayed).toFixed(2)],
      ["PP %",       `${aSt.powerPlayPct}%`,                                         `${hSt.powerPlayPct}%`],
      ["PK %",       `${aSt.penaltyKillPct}%`,                                       `${hSt.penaltyKillPct}%`],
    ];
    values["team_comparison_table"] = renderer.renderTable(
      ["Stat", game.awayTeam.abbrev, game.homeTeam.abbrev],
      compRows,
    );
  } else {
    values["team_comparison_table"] = renderer.renderBold("Stats comparison unavailable.");
  }

  // Top skaters by points over their last 5 games
  const skaterRows = (s: typeof lastFive.home) =>
    (s?.skaters ?? []).map(p => [p.name, p.positionCode, String(p.gamesPlayed), String(p.goals), String(p.assists), String(p.points)]);
  const skaterHeaders = ["Player", "Pos", "GP", "G", "A", "PTS"];

  values["away_last5_skaters_table"] = skaterRows(lastFive.away).length > 0
    ? renderer.renderTable(skaterHeaders, skaterRows(lastFive.away))
    : renderer.renderItalic("No last-5-games stats available.");
  values["home_last5_skaters_table"] = skaterRows(lastFive.home).length > 0
    ? renderer.renderTable(skaterHeaders, skaterRows(lastFive.home))
    : renderer.renderItalic("No last-5-games stats available.");

  // Starting goalie head-to-head: whoever is set as the starter in the
  // Lineup Builder for each team, with their photo, season stats, and backup
  // (season-to-date, not last-5 — a goalie's last 5 games are often just 1-2
  // starts, too small a sample to be meaningful).
  const awayGoalie = resolveStartingGoalie(lineups.away.goalies, rosters.away, lastFive.away?.goalies ?? []);
  const homeGoalie = resolveStartingGoalie(lineups.home.goalies, rosters.home, lastFive.home?.goalies ?? []);

  const photoCell = (g: StartingGoalieInfo) => g.headshot ? renderer.renderImage(g.headshot, g.name, 64) : "";

  const goalieComparisonRows = [
    ["", photoCell(awayGoalie), photoCell(homeGoalie)],
    ["Goalie", awayGoalie.name || "TBD", homeGoalie.name || "TBD"],
    ["GP", formatGoalieStat(awayGoalie, s => String(s.gamesPlayed)), formatGoalieStat(homeGoalie, s => String(s.gamesPlayed))],
    ["Record", formatGoalieStat(awayGoalie, s => `${s.wins}-${s.losses}-${s.otLosses}`), formatGoalieStat(homeGoalie, s => `${s.wins}-${s.losses}-${s.otLosses}`)],
    ["GAA", formatGoalieStat(awayGoalie, s => s.goalsAgainstAvg.toFixed(2)), formatGoalieStat(homeGoalie, s => s.goalsAgainstAvg.toFixed(2))],
    ["SV%", formatGoalieStat(awayGoalie, s => s.savePct.toFixed(3).replace(/^0/, "")), formatGoalieStat(homeGoalie, s => s.savePct.toFixed(3).replace(/^0/, ""))],
    ["Backup", awayGoalie.backupName || "TBD", homeGoalie.backupName || "TBD"],
  ];

  values["starting_goalies_table"] = renderer.renderTable(
    ["Stat", game.awayTeam.abbrev, game.homeTeam.abbrev],
    goalieComparisonRows,
  );

  // Lineups — plain text, or with headshots inlined per player
  values["away_lineup"] = renderer.renderLineup(lineups.away);
  values["home_lineup"] = renderer.renderLineup(lineups.home);
  values["away_lineup_images"] = renderer.renderLineupWithPhotos(lineups.away, buildHeadshotMap(rosters.away));
  values["home_lineup_images"] = renderer.renderLineupWithPhotos(lineups.home, buildHeadshotMap(rosters.home));

  // Quotes
  values["quotes"] = quotes.length > 0
    ? quotes.map(q => renderer.renderQuote(q.author, q.role, q.text)).join("\n\n")
    : renderer.renderItalic("No recent quotes available.");

  // Media tweets selected for embedding
  values["tweets"] = state.selectedTweets.length > 0
    ? renderer.renderTweets(state.selectedTweets)
    : renderer.renderItalic("No tweets selected.");

  return values;
}

// ─── BBCode preview ───────────────────────────────────────────────────────────

function bbcodeToHtml(raw: string): string {
  return raw
    .replace(/\[B\](.*?)\[\/B\]/g, "<strong>$1</strong>")
    .replace(/\[I\](.*?)\[\/I\]/g, "<em>$1</em>")
    .replace(/\[CENTER\]([\s\S]*?)\[\/CENTER\]/g, "<div style='text-align:center'>$1</div>")
    .replace(/\[SIZE=(\d+)\]([\s\S]*?)\[\/SIZE\]/g, (_, sz, t) => {
      const px = sz === "7" ? "32px" : sz === "6" ? "24px" : sz === "5" ? "20px" : "14px";
      return `<span style="font-size:${px}">${t}</span>`;
    })
    .replace(/\[COLOR=(.*?)\]([\s\S]*?)\[\/COLOR\]/g, "<span style='color:$1'>$2</span>")
    .replace(/\[HR\]\[\/HR\]/g, "<hr style='border:0;border-top:1px solid #444;margin:15px 0'>")
    .replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, "<table style='border-collapse:collapse;margin:10px auto;min-width:80%;border:1px solid #ccc'>$1</table>")
    .replace(/\[TR\]([\s\S]*?)\[\/TR\]/g, "<tr style='border-bottom:1px solid #ccc'>$1</tr>")
    .replace(/\[TH\]([\s\S]*?)\[\/TH\]/g, "<th style='border:1px solid #ccc;padding:8px;background:#f4f4f4;text-align:left;font-weight:bold'>$1</th>")
    .replace(/\[TD\]([\s\S]*?)\[\/TD\]/g, "<td style='border:1px solid #ccc;padding:8px;vertical-align:top'>$1</td>")
    .replace(/\[QUOTE="(.*?)"\]([\s\S]*?)\[\/QUOTE\]/g, "<blockquote style='border-left:4px solid #1a73e8;background:#f9f9f9;padding:10px;margin:10px;font-style:italic'>\"$2\"<br><cite style='font-size:12px;color:#555'>— $1</cite></blockquote>")
    .replace(/\n/g, "<br>");
}

function markdownToHtml(raw: string): string {
  return raw
    .replace(/^### (.*)/gm, "<h3 style='font-size:1.2rem;border-bottom:1px solid #ddd;padding-bottom:3px;margin:15px 0 8px'>$1</h3>")
    .replace(/^#### (.*)/gm, "<h4 style='font-size:1rem;font-weight:700;margin:10px 0 5px'>$1</h4>")
    .replace(/^## (.*)/gm, "<h2 style='font-size:1.5rem;margin-bottom:10px'>$1</h2>")
    .replace(/^# (.*)/gm, "<h1 style='font-size:1.8rem;margin-bottom:10px'>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, "<hr style='border:0;border-top:1px solid #ccc;margin:20px 0'>")
    .replace(/^\* (.*)/gm, "<li>$1</li>")
    .replace(/\n/g, "<br>");
}

function buildPreview(raw: string, style: string): string {
  if (style === "html")     return raw;
  if (style === "markdown") return markdownToHtml(raw);
  return bbcodeToHtml(raw);
}

// ─── Template persistence ─────────────────────────────────────────────────────

/** Persists the editor's current contents as the saved template for the selected style. */
export function saveCurrentTemplate(refs: AppRefs): void {
  const style = refs.templateStyleSelect.value;
  const saved = localStorage.getItem("gtg_settings_templates");
  const templates = saved ? JSON.parse(saved) : {};
  templates[style] = refs.templateBodyEditor.value;
  localStorage.setItem("gtg_settings_templates", JSON.stringify(templates));
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function generateThread(refs: AppRefs, state: AppState): void {
  saveCurrentTemplate(refs);

  if (!state.selectedGame) {
    showToast(refs, "Please select a game first!");
    return;
  }

  const style    = refs.templateStyleSelect.value;
  const renderer = getRenderer(style);
  const template = refs.templateBodyEditor.value;

  const values = buildValues(state, renderer);
  const raw    = TemplateEngine.render(template, values);

  refs.outputContainer.textContent        = raw;
  refs.previewRenderedContainer.innerHTML = buildPreview(raw, style);

  // Switch to the most useful tab for the chosen format
  const activeTab = style === "html" ? "preview" : "raw";
  const tabBtn    = document.querySelector<HTMLButtonElement>(`.tab-btn[data-tab="${activeTab}"]`);
  tabBtn?.click();
}

// Re-export so main.ts doesn't need to import DEFAULT_TEMPLATES directly
export { DEFAULT_TEMPLATES };
