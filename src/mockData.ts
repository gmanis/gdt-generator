import { GameSummary, GameDetails, Roster, StandingsTeam, NewsItem, Quote } from "./types";

export const MOCK_STANDINGS: StandingsTeam[] = [
  // Atlantic Division
  { teamAbbrev: "FLA", teamName: "Florida Panthers", gamesPlayed: 82, wins: 52, losses: 24, otLosses: 6, points: 110, goalDifferential: 68, streakCode: "W", streakCount: 2, divisionName: "Atlantic", conferenceName: "Eastern" },
  { teamAbbrev: "BOS", teamName: "Boston Bruins", gamesPlayed: 82, wins: 47, losses: 20, otLosses: 15, points: 109, goalDifferential: 43, streakCode: "L", streakCount: 1, divisionName: "Atlantic", conferenceName: "Eastern" },
  { teamAbbrev: "TOR", teamName: "Toronto Maple Leafs", gamesPlayed: 82, wins: 46, losses: 26, otLosses: 10, points: 102, goalDifferential: 40, streakCode: "W", streakCount: 1, divisionName: "Atlantic", conferenceName: "Eastern" },
  { teamAbbrev: "TBL", teamName: "Tampa Bay Lightning", gamesPlayed: 82, wins: 45, losses: 29, otLosses: 8, points: 98, goalDifferential: 23, streakCode: "L", streakCount: 3, divisionName: "Atlantic", conferenceName: "Eastern" },
  // Metropolitan Division
  { teamAbbrev: "NYR", teamName: "New York Rangers", gamesPlayed: 82, wins: 55, losses: 23, otLosses: 4, points: 114, goalDifferential: 58, streakCode: "W", streakCount: 3, divisionName: "Metropolitan", conferenceName: "Eastern" },
  { teamAbbrev: "CAR", teamName: "Carolina Hurricanes", gamesPlayed: 82, wins: 52, losses: 23, otLosses: 7, points: 111, goalDifferential: 62, streakCode: "L", streakCount: 1, divisionName: "Metropolitan", conferenceName: "Eastern" },
  { teamAbbrev: "NJD", teamName: "New Jersey Devils", gamesPlayed: 82, wins: 44, losses: 30, otLosses: 8, points: 96, goalDifferential: 12, streakCode: "W", streakCount: 2, divisionName: "Metropolitan", conferenceName: "Eastern" },
  { teamAbbrev: "WSH", teamName: "Washington Capitals", gamesPlayed: 82, wins: 40, losses: 31, otLosses: 11, points: 91, goalDifferential: -37, streakCode: "W", streakCount: 1, divisionName: "Metropolitan", conferenceName: "Eastern" }
];

export const MOCK_ROSTERS: Record<string, Roster> = {
  NJD: {
    forwards: [
      { id: 8481559, firstName: "Jack", lastName: "Hughes", sweaterNumber: 86, positionCode: "C", shootsCatches: "L" },
      { id: 8477939, firstName: "Nico", lastName: "Hischier", sweaterNumber: 13, positionCode: "C", shootsCatches: "L" },
      { id: 8479407, firstName: "Jesper", lastName: "Bratt", sweaterNumber: 63, positionCode: "RW", shootsCatches: "L" },
      { id: 8478406, firstName: "Timo", lastName: "Meier", sweaterNumber: 96, positionCode: "LW", shootsCatches: "L" },
      { id: 8482109, firstName: "Dawson", lastName: "Mercer", sweaterNumber: 91, positionCode: "C", shootsCatches: "R" },
      { id: 8475744, firstName: "Ondrej", lastName: "Palat", sweaterNumber: 18, positionCode: "LW", shootsCatches: "L" },
      { id: 8477425, firstName: "Tomas", lastName: "Tatar", sweaterNumber: 90, positionCode: "LW", shootsCatches: "L" },
      { id: 8476432, firstName: "Stefan", lastName: "Noesen", sweaterNumber: 11, positionCode: "RW", shootsCatches: "R" },
      { id: 8479364, firstName: "Michael", lastName: "McLeod", sweaterNumber: 20, positionCode: "C", shootsCatches: "R" },
      { id: 8477462, firstName: "Curtis", lastName: "Lazar", sweaterNumber: 14, positionCode: "C", shootsCatches: "R" },
      { id: 8480003, firstName: "Nathan", lastName: "Bastian", sweaterNumber: 16, positionCode: "RW", shootsCatches: "R" },
      { id: 8481580, firstName: "Paul", lastName: "Cotter", sweaterNumber: 25, positionCode: "LW", shootsCatches: "L" }
    ],
    defensemen: [
      { id: 8476462, firstName: "Dougie", lastName: "Hamilton", sweaterNumber: 7, positionCode: "D", shootsCatches: "R" },
      { id: 8478443, firstName: "Jonas", lastName: "Siegenthaler", sweaterNumber: 71, positionCode: "D", shootsCatches: "L" },
      { id: 8484166, firstName: "Luke", lastName: "Hughes", sweaterNumber: 43, positionCode: "D", shootsCatches: "L" },
      { id: 8482110, firstName: "Simon", lastName: "Nemec", sweaterNumber: 17, positionCode: "D", shootsCatches: "R" },
      { id: 8479325, firstName: "Brett", lastName: "Pesce", sweaterNumber: 22, positionCode: "D", shootsCatches: "R" },
      { id: 8476470, firstName: "Brendan", lastName: "Dillon", sweaterNumber: 5, positionCode: "D", shootsCatches: "L" },
      { id: 8480829, firstName: "John", lastName: "Marino", sweaterNumber: 6, positionCode: "D", shootsCatches: "R" }
    ],
    goalies: [
      { id: 8474593, firstName: "Jacob", lastName: "Markstrom", sweaterNumber: 25, positionCode: "G", shootsCatches: "L" },
      { id: 8474596, firstName: "Jake", lastName: "Allen", sweaterNumber: 34, positionCode: "G", shootsCatches: "L" }
    ]
  },
  BOS: {
    forwards: [
      { id: 8477956, firstName: "David", lastName: "Pastrnak", sweaterNumber: 88, positionCode: "RW", shootsCatches: "R" },
      { id: 8473419, firstName: "Brad", lastName: "Marchand", sweaterNumber: 63, positionCode: "LW", shootsCatches: "L" },
      { id: 8477493, firstName: "Elias", lastName: "Lindholm", sweaterNumber: 28, positionCode: "C", shootsCatches: "R" },
      { id: 8475745, firstName: "Charlie", sweaterNumber: 13, lastName: "Coyle", positionCode: "C", shootsCatches: "R" },
      { id: 8478440, firstName: "Pavel", lastName: "Zacha", sweaterNumber: 18, positionCode: "C", shootsCatches: "L" },
      { id: 8481521, firstName: "Trent", lastName: "Frederic", sweaterNumber: 11, positionCode: "LW", shootsCatches: "L" },
      { id: 8481525, firstName: "Morgan", lastName: "Geekie", sweaterNumber: 39, positionCode: "RW", shootsCatches: "R" },
      { id: 8478498, firstName: "John", lastName: "Beecher", sweaterNumber: 19, positionCode: "C", shootsCatches: "L" },
      { id: 8479540, firstName: "Justin", lastName: "Brazeau", sweaterNumber: 55, positionCode: "RW", shootsCatches: "R" },
      { id: 8475207, firstName: "Mark", lastName: "Kastelic", sweaterNumber: 47, positionCode: "C", shootsCatches: "R" },
      { id: 8477969, firstName: "Max", lastName: "Jones", sweaterNumber: 21, positionCode: "LW", shootsCatches: "L" },
      { id: 8480830, firstName: "Cole", lastName: "Koepke", sweaterNumber: 45, positionCode: "LW", shootsCatches: "L" }
    ],
    defensemen: [
      { id: 8479365, firstName: "Charlie", lastName: "McAvoy", sweaterNumber: 73, positionCode: "D", shootsCatches: "R" },
      { id: 8476854, firstName: "Hampus", lastName: "Lindholm", sweaterNumber: 27, positionCode: "D", shootsCatches: "L" },
      { id: 8478447, firstName: "Brandon", lastName: "Carlo", sweaterNumber: 25, positionCode: "D", shootsCatches: "R" },
      { id: 8479983, firstName: "Mason", lastName: "Lohrei", sweaterNumber: 6, positionCode: "D", shootsCatches: "L" },
      { id: 8478912, firstName: "Nikita", lastName: "Zadorov", sweaterNumber: 91, positionCode: "D", shootsCatches: "L" },
      { id: 8481541, firstName: "Andrew", lastName: "Peeke", sweaterNumber: 52, positionCode: "D", shootsCatches: "R" }
    ],
    goalies: [
      { id: 8480280, firstName: "Jeremy", lastName: "Swayman", sweaterNumber: 1, positionCode: "G", shootsCatches: "L" },
      { id: 8475852, firstName: "Joonas", lastName: "Korpisalo", sweaterNumber: 70, positionCode: "G", shootsCatches: "L" }
    ]
  }
};

export const MOCK_GAMES: GameSummary[] = [
  {
    id: 2025021064,
    season: 20252026,
    gameType: 2,
    venue: "Prudential Center",
    startTimeUTC: new Date(Date.now() + 3600000 * 4).toISOString(), // 4 hours from now
    gameState: "PRE",
    tvBroadcasts: [
      { id: 309, market: "N", countryCode: "US", network: "ESPN" },
      { id: 281, market: "N", countryCode: "CA", network: "TVAS" }
    ],
    awayTeam: {
      id: 6,
      commonName: "Bruins",
      placeName: "Boston",
      abbrev: "BOS",
      logo: "https://assets.nhle.com/logos/nhl/svg/BOS_light.svg?season=20252026",
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 1,
      commonName: "Devils",
      placeName: "New Jersey",
      abbrev: "NJD",
      logo: "https://assets.nhle.com/logos/nhl/svg/NJD_light.svg",
      score: 0,
      sog: 0
    }
  }
];

export const MOCK_GAME_DETAILS: Record<number, GameDetails> = {
  2025021064: {
    id: 2025021064,
    venue: "Prudential Center",
    venueLocation: "Newark, NJ",
    startTimeUTC: new Date(Date.now() + 3600000 * 4).toISOString(),
    tvBroadcasts: [
      { id: 309, market: "N", countryCode: "US", network: "ESPN" },
      { id: 281, market: "N", countryCode: "CA", network: "TVAS" }
    ],
    awayTeam: {
      id: 6,
      commonName: "Bruins",
      placeName: "Boston",
      abbrev: "BOS",
      logo: "https://assets.nhle.com/logos/nhl/svg/BOS_light.svg?season=20252026"
    },
    homeTeam: {
      id: 1,
      commonName: "Devils",
      placeName: "New Jersey",
      abbrev: "NJD",
      logo: "https://assets.nhle.com/logos/nhl/svg/NJD_light.svg"
    },
    gameState: "PRE"
  }
};

export const MOCK_NEWS: Record<string, NewsItem[]> = {
  NJD: [
    {
      id: "njd-1",
      headline: "Sheldon Keefe previews matchup against Bruins: 'Consistency is key'",
      description: "New Jersey Devils head coach Sheldon Keefe speaks on the challenges of containing David Pastrnak and the Bruins physical play. Emphasizes structured defensive zone entry.",
      published: "2026-07-05T15:00:00Z",
      link: "https://www.espn.com/nhl/team/_/name/nsh/nashville-predators"
    },
    {
      id: "njd-2",
      headline: "Jack Hughes ready for battle after morning skate",
      description: "Devils center Jack Hughes expresses excitement for the division rivalry: 'We need these points. They're a tough squad but we feel good about our speed.'",
      published: "2026-07-05T18:30:00Z",
      link: "https://www.espn.com/nhl/player/_/id/4697413"
    }
  ],
  BOS: [
    {
      id: "bos-1",
      headline: "Brad Marchand discusses leadership role and line combinations",
      description: "Bruins captain Brad Marchand on integrating Elias Lindholm into the top line: 'Elias is smart defensively and has great vision. It makes my job easier.'",
      published: "2026-07-05T16:15:00Z",
      link: "https://www.espn.com/nhl/team/_/name/bos/boston-bruins"
    },
    {
      id: "bos-2",
      headline: "Jeremy Swayman confirmed as starter for Prudential Center clash",
      description: "Coach Jim Montgomery announces Jeremy Swayman in goal against New Jersey. Swayman looks to rebound after a tough overtime loss to Devils earlier this season.",
      published: "2026-07-05T19:00:00Z",
      link: "https://www.espn.com/nhl/team/_/name/bos/boston-bruins"
    }
  ]
};

export const MOCK_QUOTES: Quote[] = [
  {
    id: "q-1",
    author: "Sheldon Keefe",
    role: "Head Coach",
    text: "We need our details to be perfect tonight. Boston is a team that pounces on every mistake you make in the neutral zone.",
    teamAbbrev: "NJD"
  },
  {
    id: "q-2",
    author: "Jack Hughes",
    role: "Center",
    text: "Playing against Marchand is always a battle. It gets competitive out there, but that is the kind of game you love to play.",
    teamAbbrev: "NJD"
  },
  {
    id: "q-3",
    author: "Jim Montgomery",
    role: "Head Coach",
    text: "New Jersey's transition game is elite. If we don't track back hard and keep them out of our zone, it's going to be a long night.",
    teamAbbrev: "BOS"
  },
  {
    id: "q-4",
    author: "Brad Marchand",
    role: "Left Wing / Captain",
    text: "Swayman has been our rock all season. Every time he is in net we feel confident we can win any tight hockey game.",
    teamAbbrev: "BOS"
  }
];
