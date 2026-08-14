import { GameSummary, Roster, LineupConfig, Quote, StandingsTeam, TeamStats, TweetEmbed } from "./types";

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
  lineups: { home: LineupConfig; away: LineupConfig };
  quotes: Quote[];
  selectedTweets: TweetEmbed[];
}

export const state: AppState = {
  demoMode: false,
  favoriteTeam: "",
  currentDate: "",
  games: [],
  selectedGame: null,
  standings: [],
  rosters: { home: emptyRoster(), away: emptyRoster() },
  stats:   { home: null, away: null },
  lineups: { home: emptyLineup(), away: emptyLineup() },
  quotes: [],
  selectedTweets: [],
};
