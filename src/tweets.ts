import { TweetSearchResult, TweetEmbed } from "./types";
import { fetchWithProxy } from "./proxy";
import { fetchOwnApiJson } from "./ownApi";
import { MOCK_TWEET_RESULTS, MOCK_TWEET_EMBEDS } from "./mockData";

const TWEET_URL_PATTERN = /^https:\/\/(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/;

export function isTweetUrl(url: string): boolean {
  return TWEET_URL_PATTERN.test(url.trim());
}

/**
 * Finds candidate tweets from a given handle mentioning the current matchup, via
 * our own /api/tweet-search endpoint (a Google Programmable Search lookup — the
 * only piece that needs a server-side API key, so it can't go through the
 * generic CORS proxy like everything else).
 */
export async function searchTweets(
  handle: string,
  teamHint: string,
  demoMode: boolean,
): Promise<TweetSearchResult[]> {
  const cleanHandle = handle.trim().replace(/^@/, "");

  if (demoMode) {
    // Reflect whichever demo handle was actually typed (matched against the
    // fictional handles baked into the mock tweet URLs), falling back to the
    // current matchup's results so search never comes up empty in a demo.
    const all = Object.values(MOCK_TWEET_RESULTS).flat();
    const matched = all.filter(r => r.url.toLowerCase().includes(cleanHandle.toLowerCase()));
    return matched.length > 0 ? matched : (MOCK_TWEET_RESULTS[teamHint] || all);
  }

  if (!cleanHandle) return [];

  const query = `site:x.com/${cleanHandle} ${teamHint}`.trim();
  const data = await fetchOwnApiJson<{ results: TweetSearchResult[] }>(`/api/tweet-search?q=${encodeURIComponent(query)}`);
  return data.results || [];
}

/**
 * Fetches a real, styled embed (author + Twitter's own HTML) for one tweet URL
 * via the public oEmbed endpoint — no API key needed, just the usual CORS proxy.
 */
export async function fetchTweetEmbed(url: string, demoMode: boolean): Promise<TweetEmbed> {
  if (demoMode) {
    const mocked = MOCK_TWEET_EMBEDS[url];
    if (mocked) return mocked;
  }

  const oembedUrl = `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  const cacheKey = `tweet_oembed_${url}`;
  const data = await fetchWithProxy<any>(oembedUrl, cacheKey, 1000 * 60 * 60 * 24 * 7); // tweets don't change once posted

  const textMatch = /<p[^>]*>([\s\S]*?)<\/p>/.exec(data.html || "");
  const text = textMatch
    ? textMatch[1].replace(/<[^>]+>/g, "").replace(/&mdash;/g, "—").replace(/&amp;/g, "&").trim()
    : "";

  return {
    url: data.url || url,
    authorName: data.author_name || "",
    authorUrl: data.author_url || "",
    html: data.html || "",
    text,
  };
}
