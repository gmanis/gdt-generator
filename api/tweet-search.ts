export const config = {
  runtime: 'edge',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Matches a tweet permalink out of an arbitrary search-result URL (which may carry
// query params, a mobile "twitter.com" host, etc.) and normalizes it to x.com.
const TWEET_URL_PATTERN = /^https:\/\/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/;

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return jsonResponse({ error: 'Missing q parameter' }, 400);
  }

  // Server-side only — never exposed to the browser. Requires a Google
  // Programmable Search Engine (set to "search the entire web") and its
  // matching Custom Search JSON API key, both set as Vercel env vars.
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return jsonResponse(
      { error: 'Tweet search is not configured on this deployment (missing GOOGLE_SEARCH_API_KEY / GOOGLE_SEARCH_CX).' },
      501,
    );
  }

  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&num=10&q=${encodeURIComponent(q)}`;
    const res = await fetch(searchUrl);

    if (!res.ok) {
      const body = await res.text();
      return jsonResponse({ error: `Search API returned ${res.status}: ${body.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const items: any[] = data.items || [];

    const results = items
      .map(item => {
        const match = TWEET_URL_PATTERN.exec(item.link || '');
        if (!match) return null;
        return {
          url: `https://x.com/${match[1]}/status/${match[2]}`,
          title: item.title || '',
          snippet: item.snippet || '',
        };
      })
      .filter(Boolean);

    return jsonResponse({ results }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}
