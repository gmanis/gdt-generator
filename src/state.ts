import { GameSummary, Roster, LineupConfig, Quote, StandingsTeam, TeamStats, TweetEmbed, LastFiveGamesStats } from "./types";

export const emptyRoster = (): Roster => ({
  forwards: [],
  defensemen: [],
  goalies: [],
});

export const emptyLineup = (): LineupConfig => ({
  forwards: [["", "", ""], ["", "", ""], ["", "", ""], ["", "", ""]],
  defense:  [["", ""],    ["", ""],    ["", ""]],
  goalies:  ["", ""],
  scratches: [],
  notes: "",
});

export interface AppState {
  demoMode: boolean;
  favoriteTeam: string;
  currentDate: string;
  games: GameSummary[];
  selectedGame: GameSummary | null;
  standings: StandingsTeam[];
  rosters: { home: Roster; away: Roster };
  stats:   { home: TeamStats | null; away: TeamStats | null };
  lastFive: { home: LastFiveGamesStats | null; away: LastFiveGamesStats | null };
  lineups: { home: LineupConfig; away: LineupConfig };
  quotes: Quote[];
  selectedTweets: TweetEmbed[];
  timezoneCities: string[];
}

export const state: AppState = {
  demoMode: false,
  favoriteTeam: "NYR",
  currentDate: "",
  games: [],
  selectedGame: null,
  standings: [],
  rosters: { home: emptyRoster(), away: emptyRoster() },
  stats:   { home: null, away: null },
  lastFive: { home: null, away: null },
  lineups: { home: emptyLineup(), away: emptyLineup() },
  quotes: [],
  selectedTweets: [],
  timezoneCities: [],
};
