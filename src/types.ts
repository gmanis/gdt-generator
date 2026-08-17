export interface TeamSummary {
  id: number;
  commonName: string;
  placeName: string;
  abbrev: string;
  logo: string;
  darkLogo?: string;
  score?: number;
  sog?: number;
}

export interface Broadcast {
  id: number;
  market: string;
  countryCode: string;
  network: string;
}

export interface PeriodDescriptor {
  number: number;
  periodType: string;
}

export interface GameSummary {
  id: number;
  season: number;
  gameType: number;
  venue: string;
  startTimeUTC: string;
  awayTeam: TeamSummary;
  homeTeam: TeamSummary;
  gameState: "SCH" | "PRE" | "LIVE" | "CRIT" | "FINAL" | "OFF";
  tvBroadcasts: Broadcast[];
  periodDescriptor?: PeriodDescriptor;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  sweaterNumber: number;
  positionCode: string;
  shootsCatches?: string;
  heightInInches?: number;
  weightInPounds?: number;
  birthDate?: string;
  headshot?: string;
}

export interface Roster {
  forwards: Player[];
  defensemen: Player[];
  goalies: Player[];
}

export interface StandingsTeam {
  teamAbbrev: string;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalDifferential: number;
  streakCode: string;
  streakCount: number;
  divisionName: string;
  conferenceName: string;
}

export interface TeamStats {
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  powerPlayPct: number;
  penaltyKillPct: number;
}

export interface SkaterLastFiveStats {
  playerId: number;
  name: string;
  positionCode: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
}

// Season-to-date, not last-5 — a goalie's last 5 games are often only 1-2
// starts, too small a sample for a meaningful GAA/SV%.
export interface GoalieSeasonStats {
  playerId: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  goalsAgainstAvg: number;
  savePct: number;
}

export interface StatLeader {
  name: string;
  value: number;
}

// A team's season-to-date points/goals/assists leaders — not necessarily the
// same player in each category, and separate from the last-5-games skaters
// list above (which ranks by last-5 points, not season totals).
export interface SeasonStatLeaders {
  points: StatLeader | null;
  goals: StatLeader | null;
  assists: StatLeader | null;
}

export interface LastFiveGamesStats {
  skaters: SkaterLastFiveStats[];
  goalies: GoalieSeasonStats[];
  seasonLeaders: SeasonStatLeaders;
}

export interface LineupConfig {
  forwards: string[][]; // 4 lines, each with [LW, C, RW]
  defense: string[][];  // 3 pairs, each with [LD, RD]
  goalies: string[];    // [Starter, Backup]
  scratches: string[];  // scratch players
  notes: string;        // custom lineup notes
}

export interface GameDetails {
  id: number;
  venue: string;
  venueLocation?: string;
  startTimeUTC: string;
  tvBroadcasts: Broadcast[];
  awayTeam: TeamSummary;
  homeTeam: TeamSummary;
  gameState: string;
  periodDescriptor?: PeriodDescriptor;
}

export interface Quote {
  id: string;
  author: string;
  role: string;
  text: string;
  teamAbbrev: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  description: string;
  published: string;
  link: string;
  image?: string;
  byline?: string;
}

// A tweet the user has selected to embed in the generated thread, with the
// real oEmbed data needed to render it (author, and Twitter's own HTML embed).
export interface TweetEmbed {
  url: string;
  authorName: string;
  authorUrl: string;
  html: string;
  text: string;
}

// Projected lines fetched from DailyFaceoff, already grouped by the source —
// forwards/defense are player-name arrays in the same shape as LineupConfig.
export interface DailyFaceoffLines {
  teamName: string;
  sourceName: string;
  updatedAt: string;
  forwards: string[][];
  defense: string[][];
  goalies: string[];
}
