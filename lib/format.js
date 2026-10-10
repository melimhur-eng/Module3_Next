// Every price in the app goes through this, so "ETB 1,240" looks the same everywhere.
const etbFormat = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export function etb(value) {
  return etbFormat.format(value);
}
