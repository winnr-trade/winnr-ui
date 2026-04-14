/**
 * Truncates an address for display format (e.g. 5xRa...abcd).
 * 
 * @param address The full address string.
 * @param startChars Number of characters to show at the start.
 * @param endChars Number of characters to show at the end.
 * @returns The truncated address string.
 */
export function truncateAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
