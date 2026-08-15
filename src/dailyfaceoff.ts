import { DailyFaceoffLines } from "./types";
import { MOCK_DAILYFACEOFF_LINES } from "./mockData";
import { fetchOwnApiJson } from "./ownApi";

/**
 * Fetches projected line combinations for a team from our own /api/dailyfaceoff
 * endpoint (which scrapes dailyfaceoff.com server-side — no secret involved,
 * but it needs a real browser User-Agent and HTML parsing, so it can't go
 * through the generic passthrough proxy like the JSON APIs).
 */
export async function fetchDailyFaceoffLines(teamAbbrev: string, demoMode: boolean): Promise<DailyFaceoffLines> {
  if (demoMode) {
    const mocked = MOCK_DAILYFACEOFF_LINES[teamAbbrev];
    if (mocked) return mocked;
    throw new Error(`No demo line data for ${teamAbbrev}.`);
  }

  return fetchOwnApiJson<DailyFaceoffLines>(`/api/dailyfaceoff?team=${encodeURIComponent(teamAbbrev)}`);
}
