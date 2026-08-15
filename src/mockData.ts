import { GameSummary, GameDetails, Roster, StandingsTeam, NewsItem, Quote, TweetEmbed, DailyFaceoffLines } from "./types";

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
  NYR: {
    forwards: [
      { id: 8477416, firstName: "Oliver", lastName: "Bjorkstrand", sweaterNumber: 28, positionCode: "RW", shootsCatches: "R" },
      { id: 8482877, firstName: "Jaroslav", lastName: "Chmelar", sweaterNumber: 49, positionCode: "RW", shootsCatches: "R" },
      { id: 8482157, firstName: "Will", lastName: "Cuylle", sweaterNumber: 50, positionCode: "LW", shootsCatches: "L" },
      { id: 8481604, firstName: "Pavel", lastName: "Dorofeyev", sweaterNumber: 16, positionCode: "RW", shootsCatches: "L" },
      { id: 8481789, firstName: "Tye", lastName: "Kartye", sweaterNumber: 24, positionCode: "LW", shootsCatches: "L" },
      { id: 8483690, firstName: "Noah", lastName: "Laba", sweaterNumber: 42, positionCode: "C", shootsCatches: "R" },
      { id: 8482109, firstName: "Alexis", lastName: "Lafrenière", sweaterNumber: 13, positionCode: "LW", shootsCatches: "L" },
      { id: 8476468, firstName: "J.T.", lastName: "Miller", sweaterNumber: 10, positionCode: "C", shootsCatches: "L" },
      { id: 8484210, firstName: "Gabe", lastName: "Perreault", sweaterNumber: 94, positionCode: "RW", shootsCatches: "L" },
      { id: 8479390, firstName: "Taylor", lastName: "Raddysh", sweaterNumber: 14, positionCode: "RW", shootsCatches: "R" },
      { id: 8482460, firstName: "Matt", lastName: "Rempe", sweaterNumber: 73, positionCode: "C", shootsCatches: "R" },
      { id: 8483669, firstName: "Adam", lastName: "Sykora", sweaterNumber: 38, positionCode: "LW", shootsCatches: "L" },
      { id: 8480813, firstName: "Joe", lastName: "Veleno", sweaterNumber: 90, positionCode: "C", shootsCatches: "L" },
      { id: 8476459, firstName: "Mika", lastName: "Zibanejad", sweaterNumber: 93, positionCode: "C", shootsCatches: "R" }
    ],
    defensemen: [
      { id: 8480434, firstName: "Sean", lastName: "Durzi", sweaterNumber: 5, positionCode: "D", shootsCatches: "R" },
      { id: 8484169, firstName: "Drew", lastName: "Fortescue", sweaterNumber: 45, positionCode: "D", shootsCatches: "L" },
      { id: 8479323, firstName: "Adam", lastName: "Fox", sweaterNumber: 23, positionCode: "D", shootsCatches: "R" },
      { id: 8478882, firstName: "Vladislav", lastName: "Gavrikov", sweaterNumber: 44, positionCode: "D", shootsCatches: "L" },
      { id: 8482861, firstName: "Vincent", lastName: "Iorio", sweaterNumber: 6, positionCode: "D", shootsCatches: "R" },
      { id: 8477969, firstName: "Marcus", lastName: "Pettersson", sweaterNumber: 26, positionCode: "D", shootsCatches: "L" },
      { id: 8481525, firstName: "Matthew", lastName: "Robertson", sweaterNumber: 29, positionCode: "D", shootsCatches: "L" },
      { id: 8482073, firstName: "Braden", lastName: "Schneider", sweaterNumber: 4, positionCode: "D", shootsCatches: "R" },
      { id: 8480001, firstName: "Urho", lastName: "Vaakanainen", sweaterNumber: 18, positionCode: "D", shootsCatches: "L" }
    ],
    goalies: [
      { id: 8482193, firstName: "Dylan", lastName: "Garand", sweaterNumber: 33, positionCode: "G", shootsCatches: "L" },
      { id: 8476914, firstName: "Joonas", lastName: "Korpisalo", sweaterNumber: 70, positionCode: "G", shootsCatches: "L" },
      { id: 8478048, firstName: "Igor", lastName: "Shesterkin", sweaterNumber: 31, positionCode: "G", shootsCatches: "L" }
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
      { id: 281, market: "N", countryCode: "US", network: "MSG" }
    ],
    awayTeam: {
      id: 3,
      commonName: "Rangers",
      placeName: "New York",
      abbrev: "NYR",
      logo: "https://assets.nhle.com/logos/nhl/svg/NYR_light.svg",
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
      { id: 281, market: "N", countryCode: "US", network: "MSG" }
    ],
    awayTeam: {
      id: 3,
      commonName: "Rangers",
      placeName: "New York",
      abbrev: "NYR",
      logo: "https://assets.nhle.com/logos/nhl/svg/NYR_light.svg"
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
      headline: "Sheldon Keefe previews matchup against Rangers: 'Consistency is key'",
      description: "New Jersey Devils head coach Sheldon Keefe speaks on the challenges of containing the Rangers' top line and their physical play. Emphasizes structured defensive zone entry.",
      published: "2026-07-05T15:00:00Z",
      link: "https://www.espn.com/nhl/team/_/name/njd/new-jersey-devils"
    },
    {
      id: "njd-2",
      headline: "Jack Hughes ready for battle after morning skate",
      description: "Devils center Jack Hughes expresses excitement for the Hudson River Rivalry: 'We need these points. They're a tough squad but we feel good about our speed.'",
      published: "2026-07-05T18:30:00Z",
      link: "https://www.espn.com/nhl/player/_/id/4697413"
    }
  ],
  NYR: [
    {
      id: "nyr-1",
      headline: "Mika Zibanejad discusses leadership role and line combinations",
      description: "Rangers alternate captain Mika Zibanejad on the team's forward depth heading into the Devils game: 'Everyone up and down the lineup can make a difference. It makes my job easier.'",
      published: "2026-07-05T16:15:00Z",
      link: "https://www.espn.com/nhl/team/_/name/nyr/new-york-rangers"
    },
    {
      id: "nyr-2",
      headline: "Igor Shesterkin confirmed as starter for Prudential Center clash",
      description: "Coach Mike Sullivan announces Igor Shesterkin in goal against New Jersey. Shesterkin looks to rebound after a tough overtime loss to the Devils earlier this season.",
      published: "2026-07-05T19:00:00Z",
      link: "https://www.espn.com/nhl/team/_/name/nyr/new-york-rangers"
    }
  ]
};

export const MOCK_QUOTES: Quote[] = [
  {
    id: "q-1",
    author: "Sheldon Keefe",
    role: "Head Coach",
    text: "We need our details to be perfect tonight. The Rangers are a team that pounces on every mistake you make in the neutral zone.",
    teamAbbrev: "NJD"
  },
  {
    id: "q-2",
    author: "Jack Hughes",
    role: "Center",
    text: "Playing against a rival like the Rangers is always a battle. It gets competitive out there, but that is the kind of game you love to play.",
    teamAbbrev: "NJD"
  },
  {
    id: "q-3",
    author: "Mike Sullivan",
    role: "Head Coach",
    text: "New Jersey's transition game is elite. If we don't track back hard and keep them out of our zone, it's going to be a long night.",
    teamAbbrev: "NYR"
  },
  {
    id: "q-4",
    author: "Mika Zibanejad",
    role: "Center / Alternate Captain",
    text: "Shesterkin has been our rock all season. Every time he is in net we feel confident we can win any tight hockey game.",
    teamAbbrev: "NYR"
  }
];

// Fictional demo-only tweets (not real reporters) so pasting one of these exact
// URLs into Media Tweets shows a demo embed without hitting the real oEmbed API.
export const MOCK_TWEET_EMBEDS: Record<string, TweetEmbed> = {
  "https://x.com/DevilsBeatDemo/status/1000000000000000001": {
    url: "https://x.com/DevilsBeatDemo/status/1000000000000000001",
    authorName: "Devils Beat Demo",
    authorUrl: "https://x.com/DevilsBeatDemo",
    text: "Keefe confirms Markstrom gets the start tonight against the Rangers. Lineup mostly steady heading into puck drop.",
    html: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Keefe confirms Markstrom gets the start tonight against the Rangers. Lineup mostly steady heading into puck drop.</p>&mdash; Devils Beat Demo (@DevilsBeatDemo) <a href="https://x.com/DevilsBeatDemo/status/1000000000000000001">March 10, 2026</a></blockquote>`
  },
  "https://x.com/DevilsBeatDemo/status/1000000000000000002": {
    url: "https://x.com/DevilsBeatDemo/status/1000000000000000002",
    authorName: "Devils Beat Demo",
    authorUrl: "https://x.com/DevilsBeatDemo",
    text: "Hughes line looked sharp at morning skate. Expect heavy minutes in a tight one tonight.",
    html: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Hughes line looked sharp at morning skate. Expect heavy minutes in a tight one tonight.</p>&mdash; Devils Beat Demo (@DevilsBeatDemo) <a href="https://x.com/DevilsBeatDemo/status/1000000000000000002">March 10, 2026</a></blockquote>`
  },
  "https://x.com/RangersBeatDemo/status/2000000000000000001": {
    url: "https://x.com/RangersBeatDemo/status/2000000000000000001",
    authorName: "Rangers Beat Demo",
    authorUrl: "https://x.com/RangersBeatDemo",
    text: "Shesterkin in net for New York. Sullivan still finalizing the fourth line ahead of puck drop.",
    html: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Shesterkin in net for New York. Sullivan still finalizing the fourth line ahead of puck drop.</p>&mdash; Rangers Beat Demo (@RangersBeatDemo) <a href="https://x.com/RangersBeatDemo/status/2000000000000000001">March 10, 2026</a></blockquote>`
  }
};

// Demo-mode stand-in for the real /api/dailyfaceoff fetch. The NYR entry mirrors
// real DailyFaceoff line combinations captured for this roster; NJD is a
// plausible illustrative grouping.
export const MOCK_DAILYFACEOFF_LINES: Record<string, DailyFaceoffLines> = {
  NYR: {
    teamName: "New York Rangers",
    sourceName: "DailyFaceoff (Demo)",
    updatedAt: "2026-07-04T12:39:36.766Z",
    forwards: [
      ["Gabe Perreault", "Mika Zibanejad", "Pavel Dorofeyev"],
      ["Oliver Bjorkstrand", "J.T. Miller", "Alexis Lafrenière"],
      ["Will Cuylle", "Noah Laba", "Taylor Raddysh"],
      ["Tye Kartye", "Joe Veleno", "Matt Rempe"]
    ],
    defense: [
      ["Vladislav Gavrikov", "Adam Fox"],
      ["Marcus Pettersson", "Sean Durzi"],
      ["Matthew Robertson", "Braden Schneider"]
    ],
    goalies: ["Igor Shesterkin", "Joonas Korpisalo"]
  },
  NJD: {
    teamName: "New Jersey Devils",
    sourceName: "DailyFaceoff (Demo)",
    updatedAt: "2026-07-04T12:39:36.766Z",
    forwards: [
      ["Ondrej Palat", "Nico Hischier", "Jesper Bratt"],
      ["Timo Meier", "Jack Hughes", "Dawson Mercer"],
      ["Tomas Tatar", "Michael McLeod", "Stefan Noesen"],
      ["Paul Cotter", "Curtis Lazar", "Nathan Bastian"]
    ],
    defense: [
      ["Jonas Siegenthaler", "Dougie Hamilton"],
      ["Luke Hughes", "Brett Pesce"],
      ["Simon Nemec", "John Marino"]
    ],
    goalies: ["Jacob Markstrom", "Jake Allen"]
  }
};
