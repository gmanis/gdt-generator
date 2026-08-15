/**
 * Fetches JSON from one of this app's own /api/* serverless functions
 * (dailyfaceoff). Those only run when deployed on Vercel, or locally under
 * `vercel dev` — under plain `npm run dev` (Vite's own dev server), the
 * request falls through to Vite's dev server instead, which returns HTML,
 * not JSON. Left unguarded, that surfaces as a confusing "Unexpected token
 * '<'" JSON parse error; this gives a clear message instead.
 */
export async function fetchOwnApiJson<T = any>(path: string): Promise<T> {
  const res = await fetch(path);
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "This feature needs the app's serverless functions, which don't run under `npm run dev`. " +
      "Use `vercel dev` or a real Vercel deployment to test it."
    );
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
