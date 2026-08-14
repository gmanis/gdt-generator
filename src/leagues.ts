import { GameSummary, GameDetails, Roster, StandingsTeam, NewsItem, TeamStats, TeamSummary, Player } from "./types";
import { CacheManager } from "./cache";
import * as mock from "./mockData";

// The NHL standings endpoint doesn't expose PP%/PK%, so real (non-demo) team
// stats fall back to this league-average placeholder until a real source is wired up.
const LEAGUE_AVERAGE_SPECIAL_TEAMS = { powerPlayPct: 20.0, penaltyKillPct: 80.0 };

export interface LeagueProvider {
  id: string;
  name: string;
  fetchGames(dateStr: string, demoMode: boolean): Promise<GameSummary[]>;
  fetchGameDetails(gameId: number, demoMode: boolean): Promise<GameDetails>;
  fetchTeamRoster(teamAbbrev: string, demoMode: boolean): Promise<Roster>;
  fetchStandings(demoMode: boolean): Promise<StandingsTeam[]>;
  fetchTeamStats(teamAbbrev: string, standings: StandingsTeam[], demoMode: boolean): Promise<TeamStats | null>;
  fetchTeamNews(teamAbbrev: string, demoMode: boolean): Promise<NewsItem[]>;
}

export class NhlLeagueProvider implements LeagueProvider {
  id = "nhl";
  name = "NHL";

  private getProxyUrl(targetUrl: string): string {
    const proxySetting = localStorage.getItem("gtg_settings_cors_proxy");
    if (proxySetting === null) {
      // Default to corsproxy.io
      return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    }
    if (!proxySetting.trim()) {
      return targetUrl; // Direct connection
    }
    // Replace placeholder {url} or just prepend
    if (proxySetting.includes("{url}")) {
      return proxySetting.replace("{url}", encodeURIComponent(targetUrl));
    }
    return `${proxySetting}${encodeURIComponent(targetUrl)}`;
  }

  private async fetchWithProxy<T>(url: string, cacheKey: string, ttlMs: number): Promise<T> {
    // Check Cache first
    const cached = CacheManager.get<T>(cacheKey);
    if (cached) return cached;

    // Fetch
    const proxiedUrl = this.getProxyUrl(url);
    const response = await fetch(proxiedUrl, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const data = await response.json() as T;

    // Save to Cache
    CacheManager.set(cacheKey, data, ttlMs);
    return data;
  }

  private mapTeamSummary(t: any): TeamSummary {
    return {
      id: t.id,
      commonName: t.commonName?.default || t.abbrev,
      placeName: t.placeName?.default || "",
      abbrev: t.abbrev,
      logo: t.logo,
      darkLogo: t.darkLogo,
      score: t.score,
      sog: t.sog
    };
  }

  async fetchGames(dateStr: string, demoMode: boolean): Promise<GameSummary[]> {
    if (demoMode) {
      return mock.MOCK_GAMES;
    }
    // Date format: YYYY-MM-DD
    const url = `https://api-web.nhle.com/v1/schedule/${dateStr}`;
    const cacheKey = `nhl_schedule_${dateStr}`;
    const ttl = 1000 * 60 * 60 * 2; // 2 hours

    interface ScheduleResponse {
      gameWeek?: Array<{
        date: string;
        games: any[];
      }>;
    }

    try {
      const res = await this.fetchWithProxy<ScheduleResponse>(url, cacheKey, ttl);
      if (!res.gameWeek || res.gameWeek.length === 0) return [];
      
      const day = res.gameWeek.find(d => d.date === dateStr);
      if (!day) return [];

      return day.games.map(g => ({
        id: g.id,
        season: g.season,
        gameType: g.gameType,
        venue: g.venue?.default || "TBD Venue",
        startTimeUTC: g.startTimeUTC,
        gameState: g.gameState,
        tvBroadcasts: g.tvBroadcasts || [],
        periodDescriptor: g.periodDescriptor,
        awayTeam: this.mapTeamSummary(g.awayTeam),
        homeTeam: this.mapTeamSummary(g.homeTeam)
      }));
    } catch (e) {
      console.error("fetchGames error:", e);
      throw e;
    }
  }

  async fetchGameDetails(gameId: number, demoMode: boolean): Promise<GameDetails> {
    if (demoMode) {
      return mock.MOCK_GAME_DETAILS[gameId] || mock.MOCK_GAME_DETAILS[2025021064];
    }

    const url = `https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`;
    const cacheKey = `nhl_game_details_${gameId}`;
    const ttl = 1000 * 60 * 15; // 15 mins (if live/pre) or cached permanently inside loader if FINAL

    try {
      const g = await this.fetchWithProxy<any>(url, cacheKey, ttl);
      
      // If game is finished, we can overwrite cache with higher TTL (indefinite)
      if (g.gameState === "FINAL" || g.gameState === "OFF") {
        CacheManager.set(cacheKey, g, 1000 * 60 * 60 * 24 * 365); // 1 year
      }

      return {
        id: g.id,
        venue: g.venue?.default || "Unknown Venue",
        venueLocation: g.venueLocation?.default,
        startTimeUTC: g.startTimeUTC,
        tvBroadcasts: g.tvBroadcasts || [],
        gameState: g.gameState,
        periodDescriptor: g.periodDescriptor,
        awayTeam: this.mapTeamSummary(g.awayTeam),
        homeTeam: this.mapTeamSummary(g.homeTeam)
      };
    } catch (e) {
      console.error("fetchGameDetails error:", e);
      throw e;
    }
  }

  async fetchTeamRoster(teamAbbrev: string, demoMode: boolean): Promise<Roster> {
    if (demoMode) {
      const roster = mock.MOCK_ROSTERS[teamAbbrev] || { forwards: [], defensemen: [], goalies: [] };
      // Mock rosters don't carry headshot URLs, so synthesize them from the
      // real NHL CDN using each player's real id (falls back to a placeholder in the UI if stale).
      const withHeadshots = (players: Player[]): Player[] =>
        players.map(p => ({
          ...p,
          headshot: p.headshot || `https://assets.nhle.com/mugs/nhl/20242025/${teamAbbrev}/${p.id}.png`
        }));
      return {
        forwards: withHeadshots(roster.forwards),
        defensemen: withHeadshots(roster.defensemen),
        goalies: withHeadshots(roster.goalies)
      };
    }

    const url = `https://api-web.nhle.com/v1/roster/${teamAbbrev}/current`;
    const cacheKey = `nhl_roster_${teamAbbrev}`;
    const ttl = 1000 * 60 * 60 * 24; // 24 hours

    try {
      const data = await this.fetchWithProxy<any>(url, cacheKey, ttl);

      const mapPlayer = (p: any) => ({
        id: p.id,
        firstName: p.firstName?.default || "",
        lastName: p.lastName?.default || "",
        sweaterNumber: p.sweaterNumber || 0,
        positionCode: p.positionCode || "",
        shootsCatches: p.shootsCatches,
        heightInInches: p.heightInInches,
        weightInPounds: p.weightInPounds,
        birthDate: p.birthDate,
        headshot: p.headshot
      });

      return {
        forwards: (data.forwards || []).map(mapPlayer),
        defensemen: (data.defensemen || []).map(mapPlayer),
        goalies: (data.goalies || []).map(mapPlayer)
      };
    } catch (e) {
      console.error("fetchTeamRoster error:", e);
      throw e;
    }
  }

  async fetchStandings(demoMode: boolean): Promise<StandingsTeam[]> {
    if (demoMode) {
      return mock.MOCK_STANDINGS;
    }

    const url = `https://api-web.nhle.com/v1/standings/now`;
    const cacheKey = `nhl_standings_now`;
    const ttl = 1000 * 60 * 60 * 6; // 6 hours

    interface StandingsResponse {
      standings: any[];
    }

    try {
      const res = await this.fetchWithProxy<StandingsResponse>(url, cacheKey, ttl);
      return (res.standings || []).map(t => ({
        teamAbbrev: t.teamAbbrev?.default || t.teamAbbrev,
        teamName: t.teamName?.default || "",
        gamesPlayed: t.gamesPlayed || 0,
        wins: t.wins || 0,
        losses: t.losses || 0,
        otLosses: t.otLosses || 0,
        points: t.points || 0,
        goalDifferential: t.goalDifferential || 0,
        streakCode: t.streakCode || "W",
        streakCount: t.streakCount || 0,
        divisionName: t.divisionName || "",
        conferenceName: t.conferenceName || ""
      }));
    } catch (e) {
      console.error("fetchStandings error:", e);
      return [];
    }
  }

  async fetchTeamStats(teamAbbrev: string, standings: StandingsTeam[], demoMode: boolean): Promise<TeamStats | null> {
    const s = standings.find(t => t.teamAbbrev === teamAbbrev);
    if (!s) return null;

    if (demoMode) {
      if (teamAbbrev === "NJD") {
        return { wins: 44, losses: 30, otLosses: 8, points: 96, gamesPlayed: 82, goalsFor: 264, goalsAgainst: 252, powerPlayPct: 22.4, penaltyKillPct: 80.2 };
      } else {
        return { wins: 47, losses: 20, otLosses: 15, points: 109, gamesPlayed: 82, goalsFor: 267, goalsAgainst: 224, powerPlayPct: 22.2, penaltyKillPct: 82.5 };
      }
    }

    // The standings response we already fetched carries each team's seasonId,
    // which the team-summary endpoint below needs to know which season to report on.
    const rawStandings = CacheManager.get<any>("nhl_standings_now");
    const rawTeam = rawStandings?.standings?.find((t: any) => (t.teamAbbrev?.default || t.teamAbbrev) === teamAbbrev);
    const seasonId = rawTeam?.seasonId;

    if (seasonId) {
      try {
        const real = await this.fetchRealTeamStats(teamAbbrev, seasonId);
        if (real) return real;
      } catch (e) {
        console.warn("fetchTeamStats: team/summary lookup failed:", e);
      }
    }

    // Real stats lookup failed — fall back to what standings already gives us,
    // with a league-average placeholder for PP%/PK%.
    return {
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      points: s.points,
      gamesPlayed: s.gamesPlayed,
      goalsFor: rawTeam?.goalFor ?? 0,
      goalsAgainst: rawTeam?.goalAgainst ?? 0,
      ...LEAGUE_AVERAGE_SPECIAL_TEAMS
    };
  }

  /**
   * Real wins/losses/goals/PP%/PK% from the NHL stats API for a given season.
   * That endpoint keys rows by an internal numeric teamId (not the abbrev used
   * everywhere else), so this also resolves the team list to find the right one —
   * matched only against ids that actually appear in this season's summary, since
   * relocated/renamed franchises (e.g. Utah) can have more than one id on file.
   */
  private async fetchRealTeamStats(teamAbbrev: string, seasonId: number): Promise<TeamStats | null> {
    const summaryUrl = `https://api.nhle.com/stats/rest/en/team/summary?cayenneExp=seasonId=${seasonId}%20and%20gameTypeId=2`;
    const teamListUrl = "https://api.nhle.com/stats/rest/en/team";

    const [summary, teamList] = await Promise.all([
      this.fetchWithProxy<{ data: any[] }>(summaryUrl, `nhl_team_summary_${seasonId}`, 1000 * 60 * 60 * 6),
      this.fetchWithProxy<{ data: any[] }>(teamListUrl, "nhl_team_list", 1000 * 60 * 60 * 24 * 30)
    ]);

    const idsInSummary = new Set(summary.data.map(r => r.teamId));
    const teamEntry = teamList.data.find(t => t.triCode === teamAbbrev && idsInSummary.has(t.id));
    const row = teamEntry && summary.data.find(r => r.teamId === teamEntry.id);
    if (!row) return null;

    const pct = (frac: number): number => Math.round((frac || 0) * 1000) / 10; // fraction -> percent, 1 decimal

    return {
      wins: row.wins ?? 0,
      losses: row.losses ?? 0,
      otLosses: row.otLosses ?? 0,
      points: row.points ?? 0,
      gamesPlayed: row.gamesPlayed ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
      powerPlayPct: pct(row.powerPlayPct),
      penaltyKillPct: pct(row.penaltyKillPct)
    };
  }

  async fetchTeamNews(teamAbbrev: string, demoMode: boolean): Promise<NewsItem[]> {
    if (demoMode) {
      return mock.MOCK_NEWS[teamAbbrev] || [];
    }

    // Resolve ESPN team ID
    const teamId = await this.getEspnTeamId(teamAbbrev);
    if (!teamId) return [];

    const url = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${teamId}/news`;
    const cacheKey = `espn_news_${teamAbbrev}`;
    const ttl = 1000 * 60 * 30; // 30 mins

    interface EspnNewsResponse {
      articles?: any[];
    }

    try {
      // Since ESPN news API has no CORS headers, we query through the same proxy
      const data = await this.fetchWithProxy<EspnNewsResponse>(url, cacheKey, ttl);
      if (!data.articles) return [];

      return data.articles.slice(0, 5).map(art => ({
        id: String(art.id),
        headline: art.headline || "",
        description: art.description || "",
        published: art.published || "",
        link: art.links?.web?.href || "",
        image: art.images?.[0]?.url,
        byline: art.byline
      }));
    } catch (e) {
      console.error("fetchTeamNews error:", e);
      return [];
    }
  }

  private async getEspnTeamId(teamAbbrev: string): Promise<number | null> {
    const upper = teamAbbrev.toUpperCase();
    const espnAbbrev = ESPN_ABBREV_OVERRIDES[upper] ?? upper;

    try {
      const url = "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams";
      const data = await this.fetchWithProxy<any>(url, "espn_team_list", 1000 * 60 * 60 * 24 * 30);
      const teams = data.sports?.[0]?.leagues?.[0]?.teams ?? [];
      for (const tItem of teams) {
        const team = tItem.team;
        if (team?.abbreviation?.toUpperCase() === espnAbbrev && team.id) {
          return Number(team.id);
        }
      }
    } catch (e) {
      console.warn("Failed resolving ESPN team list:", e);
    }

    // ESPN lookup failed or didn't include this team — fall back to a hardcoded table.
    return ESPN_TEAM_ID_FALLBACK[upper] || null;
  }
}

// ESPN uses different abbreviations than the NHL API for these five teams —
// without this translation, the live lookup above silently never matches them
// and always falls through to the hardcoded table below.
const ESPN_ABBREV_OVERRIDES: Record<string, string> = {
  NJD: "NJ", LAK: "LA", SJS: "SJ", TBL: "TB", UTA: "UTAH"
};

// Verified directly against https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams
// on 2026-08-14. Only used if the live lookup above fails.
const ESPN_TEAM_ID_FALLBACK: Record<string, number> = {
  ANA: 25, BOS: 1, BUF: 2, CAR: 7, CBJ: 29, CGY: 3, CHI: 4,
  COL: 17, DAL: 9, DET: 5, EDM: 6, FLA: 26, LAK: 8, MIN: 30, MTL: 10,
  NJD: 11, NSH: 27, NYI: 12, NYR: 13, OTT: 14, PHI: 15, PIT: 16, SJS: 18,
  SEA: 124292, STL: 19, TBL: 20, TOR: 21, UTA: 129764, VAN: 22, VGK: 37,
  WPG: 28, WSH: 23
};
