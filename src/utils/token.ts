/**
 * Formats a BigInt or string balance to a human-readable number with a given number of decimals.
 * Assumes 6 decimals by default if an exact configuration object is not provided.
 */
export function formatBalance(balance: bigint | string | number, decimals: number = 6): string {
  const balStr = balance.toString();
  const balNum = Number(balStr) / Math.pow(10, decimals);
  return formatNumber(balNum, 2, decimals >= 2 ? 2 : decimals);
}

/**
 * Handles basic comma-separation and decimal formatting for numeric display in the UI.
 */
export function formatNumber(value: number | string | bigint, minDecimals: number = 2, maxDecimals: number = 2): string {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals
  });
}
