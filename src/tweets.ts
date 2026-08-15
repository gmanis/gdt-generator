import { TweetEmbed } from "./types";
import { fetchWithProxy } from "./proxy";
import { MOCK_TWEET_EMBEDS } from "./mockData";

const TWEET_URL_PATTERN = /^https:\/\/(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/;

export function isTweetUrl(url: string): boolean {
  return TWEET_URL_PATTERN.test(url.trim());
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
