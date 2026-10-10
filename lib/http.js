// Every API error uses the same shape: { error: { message, fieldErrors? } }
export function errorResponse(status, message, fieldErrors) {
  return Response.json({ error: fieldErrors ? { message, fieldErrors } : { message } }, { status });
}
