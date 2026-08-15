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

// A candidate tweet surfaced by a search, before the user has chosen to embed it.
export interface TweetSearchResult {
  url: string;
  title: string;
  snippet: string;
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
