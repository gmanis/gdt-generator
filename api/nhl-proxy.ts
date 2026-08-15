export const config = {
  runtime: 'edge',
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
// season-specific URL. Confirmed via debug logging that Vercel's Edge Runtime
// rewrites the *hostname* of that redirect's Location header to this
// deployment's own domain (the path stays correct) — so the target ends up
// pointing at us instead of api-web.nhle.com, and following it 404s here.
// Workaround: ignore whatever host the Location header claims and rebuild the
// redirect target using the original request's real (allowlisted) origin.
async function fetchFollowingRedirects(url: string, headers: Record<string, string>, maxRedirects = 5): Promise<Response> {
  const originalOrigin = new URL(url).origin;
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, { headers, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return res;
      const locationUrl = new URL(location, currentUrl);
      currentUrl = originalOrigin + locationUrl.pathname + locationUrl.search;
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
