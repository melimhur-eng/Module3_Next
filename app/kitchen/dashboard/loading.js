// Shaped like the dashboard: a chart-sized block and a few table rows.
export default function DashboardLoading() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading the dashboard">
      <div className="skeleton-line wide" />
      <div className="skeleton-block" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
