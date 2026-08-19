/**
 * AppRefs is the single source of truth for every DOM element the app touches.
 * Add a data-ref="..." attribute in HTML, add it here, done.
 */
export interface AppRefs {
  // Header controls
  datePicker: HTMLInputElement;
  gameSelect: HTMLSelectElement;
  openImportModalBtn: HTMLButtonElement;
  openSettingsBtn: HTMLButtonElement;

  // Team display
  awayTeamName: HTMLSpanElement;
  homeTeamName: HTMLSpanElement;
  awayTeamLogo: HTMLImageElement;
  homeTeamLogo: HTMLImageElement;

  // Lineup builder
  awayLineupSlots: HTMLDivElement;
  homeLineupSlots: HTMLDivElement;
  awayScratchesInput: HTMLInputElement;
  homeScratchesInput: HTMLInputElement;

  // Quotes
  quoteAuthorInput: HTMLInputElement;
  quoteTextInput: HTMLInputElement;
  addQuoteBtn: HTMLButtonElement;
  quotesListContainer: HTMLDivElement;

  // Media tweets
  tweetUrlInput: HTMLInputElement;
  addTweetUrlBtn: HTMLButtonElement;
  selectedTweetsContainer: HTMLDivElement;

  // News feed
  newsFeedCard: HTMLDivElement;
  awayNewsContainer: HTMLDivElement;
  homeNewsContainer: HTMLDivElement;
  awayNewsTitle: HTMLElement;
  homeNewsTitle: HTMLElement;

  // Last 5 games stats
  awayLastFiveContainer: HTMLDivElement;
  homeLastFiveContainer: HTMLDivElement;
  awayLastFiveTitle: HTMLElement;
  homeLastFiveTitle: HTMLElement;
  startingGoaliesContainer: HTMLDivElement;

  // Timezone translator
  timezoneCitySearch: HTMLInputElement;
  timezoneCityOptions: HTMLDataListElement;
  addTimezoneCityBtn: HTMLButtonElement;
  timezoneCitiesContainer: HTMLDivElement;
  timezoneTableContainer: HTMLDivElement;

  // Template editor
  templateStyleSelect: HTMLSelectElement;
  templateBodyEditor: HTMLTextAreaElement;
  resetTemplateBtn: HTMLButtonElement;
  saveTemplateBtn: HTMLButtonElement;
  placeholderList: HTMLDivElement;

  // Output
  generateThreadBtn: HTMLButtonElement;
  copyToClipboardBtn: HTMLButtonElement;
  outputContainer: HTMLDivElement;
  previewRenderedContainer: HTMLDivElement;

  // Settings modal
  settingsModal: HTMLDivElement;
  demoModeToggle: HTMLInputElement;
  favoriteTeamSelect: HTMLSelectElement;
  corsProxyInput: HTMLInputElement;
  cacheStatsText: HTMLSpanElement;
  clearCacheBtn: HTMLButtonElement;
  saveSettingsBtn: HTMLButtonElement;
  closeSettingsModal: HTMLButtonElement;

  // Import lineup modal
  importModal: HTMLDivElement;
  importTeamSelect: HTMLSelectElement;
  fetchDailyFaceoffBtn: HTMLButtonElement;
  dailyFaceoffStatus: HTMLParagraphElement;
  quickPasteTextarea: HTMLTextAreaElement;
  parseLineupBtn: HTMLButtonElement;
  closeImportModal: HTMLButtonElement;

  // Global overlays
  loadingOverlay: HTMLDivElement;
  loadingText: HTMLSpanElement;
  toast: HTMLDivElement;
  toastText: HTMLSpanElement;
}

export function collectRefs(): AppRefs {
  const map: Record<string, HTMLElement> = {};
  document.querySelectorAll<HTMLElement>("[data-ref]").forEach(el => {
    map[el.getAttribute("data-ref")!] = el;
  });

  return new Proxy(map, {
    get(target, key: string) {
      if (typeof key === "symbol") return undefined;
      if (!(key in target)) throw new Error(`[GTG] Missing data-ref="${key}" in HTML`);
      return target[key];
    },
  }) as unknown as AppRefs;
}
