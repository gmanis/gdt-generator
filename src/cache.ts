interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// Keys that hold settings or user-authored content rather than fetched API
// data — never touched by clear() or counted in getCacheStats().
const NON_CACHE_KEYS = [
  "gtg_settings_cors_proxy",
  "gtg_settings_templates",
  "gtg_settings_current_template",
  "gtg_quotes",
];

export class CacheManager {
  /**
   * Store data in cache with a Time-To-Live (TTL) in milliseconds
   */
  static set<T>(key: string, data: T, ttlMs: number): void {
    try {
      const expiry = Date.now() + ttlMs;
      const entry: CacheEntry<T> = { data, expiry };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn("localStorage write failed (quota exceeded?):", e);
    }
  }

  /**
   * Retrieve data from cache. Returns null if missing or expired.
   */
  static get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.warn("localStorage read failed:", e);
      return null;
    }
  }

  /**
   * Remove specific item from cache
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all items from cache (excluding settings and user-authored data)
   */
  static clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !NON_CACHE_KEYS.includes(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get size of cached items and keys list
   */
  static getCacheStats(): { count: number; bytes: number } {
    let bytes = 0;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith("gtg_settings_") && !NON_CACHE_KEYS.includes(key)) {
        const val = localStorage.getItem(key);
        if (val) {
          bytes += (key.length + val.length) * 2; // Approximate byte size (UTF-16 characters = 2 bytes)
          count++;
        }
      }
    }
    return { count, bytes };
  }
}
