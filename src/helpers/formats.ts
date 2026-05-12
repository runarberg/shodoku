const PERCENT_FORMAT = new Intl.NumberFormat("default", { style: "percent" });

export function formatPercent(p: number): string {
  return PERCENT_FORMAT.format(p);
}

const BINARY_PREFIXES = [
  "",
  "Ki",
  "Mi",
  "Gi",
  "Ti",
  "Pi",
  "Ei",
  "Zi",
  "Yi",
] as const;

function formatBytesParts(num: number): [number, number] {
  if (!Number.isFinite(num) || Math.abs(num) < 1) {
    return [num, 0];
  }

  const exponent = Math.log2(Math.abs(num));
  const prefix = Math.min(
    Math.trunc(exponent / 10),
    BINARY_PREFIXES.length - 1,
  );

  return [num / 2 ** (prefix * 10), prefix];
}

export function formatBytes(num: number): string {
  const [x, prefix] = formatBytesParts(num);
  const displayNumber = new Intl.NumberFormat("default", {
    maximumFractionDigits: 0,
    style: "decimal",
  }).format(x);

  return `${displayNumber} ${BINARY_PREFIXES[prefix]}B`;
}
