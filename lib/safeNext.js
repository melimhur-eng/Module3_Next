// Where to send someone after signing in. Only a path on this site is allowed:
// "/checkout" is fine; "https://evil.example", "//evil.example" and
// "/\evil.example" (which browsers also treat as another site) are not.
export function safeNext(next) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
