const PERCENT_FORMAT = new Intl.NumberFormat("default", { style: "percent" });

export function formatPercent(p: number): string {
  return PERCENT_FORMAT.format(p);
}
