export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.floor(value));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}
