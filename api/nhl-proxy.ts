export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing target url parameter' }), {
      status: 400,
      headers: { 
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    const parsedUrl = new URL(url);
    const allowedHostnames = ['api-web.nhle.com', 'site.api.espn.com'];
    if (!allowedHostnames.includes(parsedUrl.hostname)) {
      return new Response(JSON.stringify({ error: 'Hostname not allowed' }), {
        status: 403,
        headers: { 
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
    });

    if (!fetchRes.ok) {
      return new Response(JSON.stringify({ error: `Target server returned ${fetchRes.status} ${fetchRes.statusText}` }), {
        status: fetchRes.status,
        headers: { 
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const data = await fetchRes.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}
