// Cities for the Timezone Translator block, sourced from the runtime's own
// IANA tz database (the "standard tz database") rather than a hand-maintained
// list — Intl.supportedValuesOf("timeZone") returns every zone identifier the
// browser ships. Each is keyed by its zone id (e.g. "America/New_York"),
// which is what gets persisted/selected; `name` is only a display label.
export interface CityTimeZone {
  name: string;
  timeZone: string;
}

// A handful of major zones to fall back to if Intl.supportedValuesOf isn't
// available (Safari < 15.4 and other older engines don't implement it).
const FALLBACK_ZONES: string[] = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "America/Anchorage", "Pacific/Honolulu",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Europe/Helsinki", "Europe/Stockholm", "Europe/Prague",
  "Asia/Tokyo", "Australia/Sydney",
];

/** Turns a zone id's last path segment into a readable city name, e.g. "America/New_York" -> "New York". */
function friendlyName(zoneId: string): string {
  const last = zoneId.split("/").pop() ?? zoneId;
  return last.replace(/_/g, " ");
}

function loadZoneIds(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return FALLBACK_ZONES;
  }
}

export const CITY_TIMEZONES: CityTimeZone[] = loadZoneIds()
  .map(timeZone => ({ name: friendlyName(timeZone), timeZone }))
  .sort((a, b) => a.name.localeCompare(b.name) || a.timeZone.localeCompare(b.timeZone));

/** The searchable label shown in the city datalist: "City Name (Zone/Id)". */
export function cityOptionLabel(city: CityTimeZone): string {
  return `${city.name} (${city.timeZone})`;
}

/**
 * Resolves free-typed datalist input back to a known zone id — matches the
 * "City Name (Zone/Id)" label, a bare zone id, or a bare city name.
 */
export function resolveTimeZoneInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parenMatch = trimmed.match(/\(([^()]+)\)\s*$/);
  const candidate = parenMatch ? parenMatch[1] : trimmed;

  const byId = CITY_TIMEZONES.find(c => c.timeZone === candidate);
  if (byId) return byId.timeZone;

  const byName = CITY_TIMEZONES.find(c => c.name.toLowerCase() === candidate.toLowerCase());
  return byName ? byName.timeZone : null;
}

/** Formats a game's UTC start time as it reads on a wall clock in the given zone. */
export function formatTimeInZone(startTimeUTC: string, timeZone: string): string {
  return new Date(startTimeUTC).toLocaleString(undefined, {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Resolves a game's local time in each of the given (by zone id) selected cities, skipping any id no longer known. */
export function gameTimesForCities(startTimeUTC: string, zoneIds: string[]): { name: string; time: string }[] {
  return zoneIds
    .map(id => CITY_TIMEZONES.find(c => c.timeZone === id))
    .filter((c): c is CityTimeZone => !!c)
    .map(c => ({ name: c.name, time: formatTimeInZone(startTimeUTC, c.timeZone) }));
}
