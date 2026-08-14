import { TweetSearchResult, TweetEmbed } from "./types";
import { fetchWithProxy } from "./proxy";
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
  if (demoMode) {
    return MOCK_TWEET_RESULTS[teamHint] || [];
  }

  const cleanHandle = handle.trim().replace(/^@/, "");
  if (!cleanHandle) return [];

  const query = `site:x.com/${cleanHandle} ${teamHint}`.trim();
  const res = await fetch(`/api/tweet-search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Tweet search failed (${res.status})`);
  }

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
