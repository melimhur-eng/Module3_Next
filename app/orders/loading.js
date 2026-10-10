// Shaped like the orders table, so nothing jumps when the rows arrive.
export default function OrdersLoading() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading your orders">
      <div className="skeleton-line wide" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
