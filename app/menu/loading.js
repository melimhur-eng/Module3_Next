// Shown automatically while anything in the /menu segment is rendering on the server.
export default function MenuLoading() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading">
      <div className="skeleton-line wide" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  );
}
