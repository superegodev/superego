export default function formatTokenCount(count: number): string {
  if (count < 1_000) {
    return String(count);
  }
  if (count < 10_000) {
    return `${truncate(count / 1_000, 2)}k`;
  }
  if (count < 100_000) {
    return `${truncate(count / 1_000, 1)}k`;
  }
  if (count < 1_000_000) {
    return `${truncate(count / 1_000, 0)}k`;
  }
  if (count < 10_000_000) {
    return `${truncate(count / 1_000_000, 2)}m`;
  }
  if (count < 100_000_000) {
    return `${truncate(count / 1_000_000, 1)}m`;
  }
  return `${truncate(count / 1_000_000, 0)}m`;
}

function truncate(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  return (Math.floor(value * factor) / factor).toFixed(decimals);
}
