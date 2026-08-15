import { Roster, LineupConfig, Player, DailyFaceoffLines } from "./types";
import { AppState, emptyLineup } from "./state";

// ─── Player Select ────────────────────────────────────────────────────────────

export function createPlayerSelect(
  players: { firstName: string; lastName: string; sweaterNumber: number; positionCode: string }[],
  placeholder: string,
): HTMLSelectElement {
  const select = document.createElement("select");

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = `-- ${placeholder} --`;
  select.appendChild(empty);

  [...players]
    .sort((a, b) => a.sweaterNumber - b.sweaterNumber)
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = `${p.firstName} ${p.lastName}`;
      opt.textContent = `#${p.sweaterNumber} - ${p.lastName}, ${p.firstName} (${p.positionCode})`;
      select.appendChild(opt);
    });

  return select;
}

// ─── Render Lineup Slots ──────────────────────────────────────────────────────

/**
 * Populates a lineup container with dropdowns for all forward lines,
 * defensive pairings, and goalie slots. Auto-fills from roster order.
 * Mutates state.lineups[team] as the user changes selections.
 */
export function renderLineupSlots(
  team: "away" | "home",
  roster: Roster,
  container: HTMLElement,
  state: AppState,
): void {
  container.innerHTML = "";

  const lineup = emptyLineup();
  state.lineups[team] = lineup;

  const { forwards: fList, defensemen: dList, goalies: gList } = roster;
  const fPositions = ["LW", "C", "RW"];
  const dPositions = ["LD", "RD"];

  // Forward lines
  const fLabel = document.createElement("div");
  fLabel.className = "section-label";
  fLabel.textContent = "Forward Lines";
  container.appendChild(fLabel);

  for (let l = 0; l < 4; l++) {
    const row = document.createElement("div");
    row.className = "row-three-slots";
    for (let i = 0; i < 3; i++) {
      const select = createPlayerSelect(fList, `Line ${l + 1} ${fPositions[i]}`);
      const rIdx = l * 3 + i;
      if (rIdx < fList.length) {
        const name = `${fList[rIdx].firstName} ${fList[rIdx].lastName}`;
        select.value = name;
        lineup.forwards[l][i] = name;
      }
      select.addEventListener("change", e => {
        lineup.forwards[l][i] = (e.target as HTMLSelectElement).value;
      });
      row.appendChild(select);
    }
    container.appendChild(row);
  }

  // Defense pairs
  const dLabel = document.createElement("div");
  dLabel.className = "section-label";
  dLabel.textContent = "Defense Pairings";
  container.appendChild(dLabel);

  for (let p = 0; p < 3; p++) {
    const row = document.createElement("div");
    row.className = "row-two-slots";
    for (let i = 0; i < 2; i++) {
      const select = createPlayerSelect(dList, `Pair ${p + 1} ${dPositions[i]}`);
      const rIdx = p * 2 + i;
      if (rIdx < dList.length) {
        const name = `${dList[rIdx].firstName} ${dList[rIdx].lastName}`;
        select.value = name;
        lineup.defense[p][i] = name;
      }
      select.addEventListener("change", e => {
        lineup.defense[p][i] = (e.target as HTMLSelectElement).value;
      });
      row.appendChild(select);
    }
    container.appendChild(row);
  }

  // Goalies
  const gLabel = document.createElement("div");
  gLabel.className = "section-label";
  gLabel.textContent = "Goalies";
  container.appendChild(gLabel);

  const gRow = document.createElement("div");
  gRow.className = "row-two-slots";
  const gRoles = ["Starter", "Backup"];
  for (let g = 0; g < 2; g++) {
    const select = createPlayerSelect(gList, gRoles[g]);
    if (g < gList.length) {
      const name = `${gList[g].firstName} ${gList[g].lastName}`;
      select.value = name;
      lineup.goalies[g] = name;
    }
    select.addEventListener("change", e => {
      lineup.goalies[g] = (e.target as HTMLSelectElement).value;
    });
    gRow.appendChild(select);
  }
  container.appendChild(gRow);
}

// ─── Sync Dropdowns After Paste Import ───────────────────────────────────────

/**
 * After parseProjectedLines() updates state.lineups[team],
 * walk the container's <select> elements in order and force their values.
 */
export function syncLineupUI(container: HTMLElement, lineup: LineupConfig): void {
  const selects = Array.from(container.querySelectorAll<HTMLSelectElement>("select"));
  let idx = 0;

  for (let l = 0; l < 4; l++)
    for (let i = 0; i < 3; i++)
      if (idx < selects.length) selects[idx++].value = lineup.forwards[l][i] ?? "";

  for (let p = 0; p < 3; p++)
    for (let i = 0; i < 2; i++)
      if (idx < selects.length) selects[idx++].value = lineup.defense[p][i] ?? "";

  for (let g = 0; g < 2; g++)
    if (idx < selects.length) selects[idx++].value = lineup.goalies[g] ?? "";
}

// ─── Name Matching ────────────────────────────────────────────────────────────

/**
 * Fuzzy-matches a name (from pasted text or an external source like DailyFaceoff)
 * against a roster, returning the roster's own "First Last" spelling so it lines
 * up with everything else keyed off that string (headshots, dropdown values).
 */
export function matchPlayerName(input: string, allPlayers: Player[]): string {
  const clean = input.replace(/[#\d\-\*\[\]]/g, "").trim().toLowerCase();
  if (!clean) return "";

  let best = "";
  let score = 0;
  for (const p of allPlayers) {
    const last = p.lastName.toLowerCase();
    const full = `${p.firstName.toLowerCase()} ${last}`;
    if (clean === full || clean === last) {
      return `${p.firstName} ${p.lastName}`;
    }
    if (clean.includes(last) && last.length > 3 && last.length > score) {
      score = last.length;
      best = `${p.firstName} ${p.lastName}`;
    }
  }
  return best || input;
}

// ─── Projected Lines Paste Parser ────────────────────────────────────────────

/**
 * Fuzzy-matches pasted plain-text line combinations against a roster.
 * Returns counts of successfully imported lines/pairs/goalies.
 */
export function parseProjectedLines(
  rawText: string,
  team: "away" | "home",
  state: AppState,
): { fLines: number; dPairs: number; goalies: number } {
  const roster = state.rosters[team];
  const lineup = state.lineups[team];
  const allPlayers = [...roster.forwards, ...roster.defensemen, ...roster.goalies];
  const fuzzyMatch = (input: string) => matchPlayerName(input, allPlayers);

  const lines = rawText
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.toLowerCase().startsWith("projected") && !l.toLowerCase().startsWith("lines"));

  let fLines = 0, dPairs = 0, goalies = 0;

  for (const lineText of lines) {
    const parts = lineText.split(/[-/,]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 3 && fLines < 4) {
      lineup.forwards[fLines] = [fuzzyMatch(parts[0]), fuzzyMatch(parts[1]), fuzzyMatch(parts[2])];
      fLines++;
    } else if (parts.length === 2 && dPairs < 3) {
      lineup.defense[dPairs] = [fuzzyMatch(parts[0]), fuzzyMatch(parts[1])];
      dPairs++;
    } else if (parts.length === 1 && goalies < 2) {
      lineup.goalies[goalies] = fuzzyMatch(parts[0]);
      goalies++;
    }
  }

  return { fLines, dPairs, goalies };
}

// ─── DailyFaceoff Import ──────────────────────────────────────────────────────

/**
 * Applies structured line data (already grouped into forward lines/D pairs/
 * goalies by the source) to a team's lineup, fuzzy-matching each name against
 * the roster the same way the paste parser does.
 */
export function applyDailyFaceoffLines(
  lines: DailyFaceoffLines,
  team: "away" | "home",
  state: AppState,
): { fLines: number; dPairs: number; goalies: number } {
  const roster = state.rosters[team];
  const lineup = state.lineups[team];
  const allPlayers = [...roster.forwards, ...roster.defensemen, ...roster.goalies];
  const fuzzyMatch = (input: string) => (input ? matchPlayerName(input, allPlayers) : "");

  let fLines = 0, dPairs = 0, goalies = 0;

  lines.forwards.slice(0, 4).forEach((line, idx) => {
    lineup.forwards[idx] = [fuzzyMatch(line[0]), fuzzyMatch(line[1]), fuzzyMatch(line[2])];
    if (line.some(Boolean)) fLines++;
  });

  lines.defense.slice(0, 3).forEach((pair, idx) => {
    lineup.defense[idx] = [fuzzyMatch(pair[0]), fuzzyMatch(pair[1])];
    if (pair.some(Boolean)) dPairs++;
  });

  lines.goalies.slice(0, 2).forEach((name, idx) => {
    lineup.goalies[idx] = fuzzyMatch(name);
    if (name) goalies++;
  });

  return { fLines, dPairs, goalies };
}
