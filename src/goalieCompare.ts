import { Roster, GoalieSeasonStats } from "./types";

// Shared by the live "Starting Goalies" UI card and the generated thread's
// {{starting_goalies_table}} placeholder, so both stay in sync with whatever
// starter/backup the user picked in the Lineup Builder.
export interface StartingGoalieInfo {
  name: string;
  headshot?: string;
  backupName: string;
  stats: GoalieSeasonStats | null;
}

/**
 * Resolves a team's starting goalie from the Lineup Builder's goalie slots
 * (index 0 = starter, 1 = backup), pairing the starter with their headshot
 * (from the roster) and season stats (from the last-5-games fetch).
 */
export function resolveStartingGoalie(
  goalieSlots: string[],
  roster: Roster,
  seasonStats: GoalieSeasonStats[],
): StartingGoalieInfo {
  const name = goalieSlots[0] || "";
  const backupName = goalieSlots[1] || "";
  const headshot = roster.goalies.find(g => `${g.firstName} ${g.lastName}` === name)?.headshot;
  const stats = seasonStats.find(g => g.name === name) ?? null;
  return { name, headshot, backupName, stats };
}
