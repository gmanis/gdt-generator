export const config = {
  runtime: 'nodejs',
};

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

// Several NHL API endpoints (roster/current, standings/now) 307-redirect to a
// season-specific URL. Vercel's Edge Runtime doesn't reliably auto-follow that
// redirect (confirmed: identical requests succeed outside the edge runtime),
// so follow it manually instead of trusting fetch()'s default redirect handling.
async function fetchFollowingRedirects(url: string, headers: Record<string, string>, maxRedirects = 5): Promise<Response> {
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, { headers, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return res;
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return res;
  }
  throw new Error(`Too many redirects fetching ${url}`);
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return jsonResponse({ error: 'Missing target url parameter' }, 400);
  }

  try {
    const parsedUrl = new URL(url);
    const allowedHostnames = ['api-web.nhle.com', 'api.nhle.com', 'site.api.espn.com', 'publish.x.com', 'publish.twitter.com'];
    if (!allowedHostnames.includes(parsedUrl.hostname)) {
      return jsonResponse({ error: 'Hostname not allowed' }, 403);
    }

    const fetchRes = await fetchFollowingRedirects(url, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json'
    });

    if (!fetchRes.ok) {
      return jsonResponse({ error: `Target server returned ${fetchRes.status} ${fetchRes.statusText}` }, fetchRes.status);
    }

    const data = await fetchRes.json();

    return jsonResponse(data, 200, {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}
