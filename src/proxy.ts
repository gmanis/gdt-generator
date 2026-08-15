import { CacheManager } from "./cache";

// Shared CORS-proxy-aware fetch helper. Used by anything that needs to call a
// third-party JSON API that doesn't set CORS headers for arbitrary origins
// (the NHL/ESPN APIs, and Twitter's public oEmbed endpoint).

export function getProxyUrl(targetUrl: string): string {
  const proxySetting = localStorage.getItem("gtg_settings_cors_proxy");
  if (proxySetting === null) {
    // Default to this app's own deployed proxy endpoint (api/nhl-proxy.ts) —
    // same-origin, so no CORS problem to solve, and it's free on Vercel's
    // Hobby plan. corsproxy.io (the old default) now blocks non-localhost
    // usage entirely without a paid key, so it's no longer a viable default.
    return `/api/nhl-proxy?url=${encodeURIComponent(targetUrl)}`;
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

export async function fetchWithProxy<T>(url: string, cacheKey: string, ttlMs: number): Promise<T> {
  // Check Cache first
  const cached = CacheManager.get<T>(cacheKey);
  if (cached) return cached;

  // Fetch
  const proxiedUrl = getProxyUrl(url);
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
