/**
 * Formats a BigInt or string balance to a human-readable number with a given number of decimals.
 * Assumes 6 decimals by default if an exact configuration object is not provided.
 */
export function formatBalance(balance: bigint | string | number, decimals: number = 6): string {
  const balStr = balance.toString();
  const balNum = Number(balStr) / 10 ** decimals;
  return formatNumber(balNum, 2, decimals >= 2 ? 2 : decimals);
}

/**
 * Handles basic comma-separation and decimal formatting for numeric display in the UI.
 */
export function formatNumber(
  value: number | string | bigint,
  minDecimals: number = 2,
  maxDecimals: number = 2,
  compact: boolean = false,
): string {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    notation: compact ? "compact" : "standard",
  });
}

/**
 * Multiplies a string representation of a number by 10^decimals to get its integer unit representation.
 */
export function parseUnits(value: string, decimals: number): bigint {
  let [integer, fraction = ""] = value.split(".");
  fraction = fraction.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(integer + fraction);
}

export const parseUsd = (value: number | string | bigint) => {
  return parseUnits(value.toString(), 6);
};

/** Converts a cent value to raw 6-decimal base units (e.g. 50 -> 500000) */
export const parseCents = (value: number | string | bigint) => {
  return parseUnits((Number(value) / 100).toString(), 6);
};

/**
 * Divides an integer unit value by 10^decimals to get its string decimal representation.
 */
export function formatUnits(value: bigint | string | number, decimals: number): string {
  const s = value.toString();
  if (decimals === 0) return s;

  const negative = s.startsWith("-");
  const absolute = negative ? s.slice(1) : s;
  const padded = absolute.padStart(decimals + 1, "0");

  const integer = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, "");

  const result = fraction ? `${integer}.${fraction}` : integer;
  return negative ? `-${result}` : result;
}

export function formatUsd(value: number | string | bigint): string {
  return formatUnits(value, 6);
}

export function formatCurrency(value: number | string | bigint, compact: boolean = false): string {
  const amount = Number(formatUsd(value));
  return `$${formatNumber(amount, 0, compact ? 1 : 2, compact)}`;
}

/** Converts raw 6-decimal base units to a cents string (e.g. 475300 -> "47.53") */
export function formatCents(value: number | string | bigint): string {
  return formatUnits(value, 6 - 2);
}

/** Converts 4-digit price units to base units of a given decimal (e.g. 4753, 6 -> 475300) */
export function priceToUnits(price: number | string | bigint, decimals: number): bigint {
  const multiplier = BigInt(10) ** BigInt(Math.max(0, decimals - 4));
  return BigInt(price) * multiplier;
}

/** Converts base units of a given decimal back to 4-digit price units (e.g. 475300, 6 -> 4753) */
export function unitsToPrice(units: number | string | bigint, decimals: number): number {
  const divisor = BigInt(10) ** BigInt(Math.max(0, decimals - 4));
  return Number(BigInt(units) / divisor);
}

/** Formats a numeric size for display, adding 'k' suffix for values >= 1000 */
export function formatSize(size: number) {
  return size >= 1000 ? `${(size / 1000).toFixed(1)}k` : size.toString();
}
