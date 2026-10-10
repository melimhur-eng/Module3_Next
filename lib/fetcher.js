// The one fetcher every SWR query uses. fetch only rejects on network
// failure, so a 404 or 500 is turned into a thrown error here — otherwise
// SWR would treat an error body as data.
export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = new Error(body?.error?.message ?? `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}
