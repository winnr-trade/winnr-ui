/**
 * Formats a timestamp (ms or s) into a human readable date string like "Ends Dec 12"
 */
export function formatDate(timestamp: number | string | undefined): string {
  if (!timestamp) return "No date";
  
  let ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (isNaN(ts)) return "Invalid Date";

  // Heuristic: if timestamp is before 2000, it's likely in seconds (approx 9.4e8)
  // If it's less than 10^12, it's likely seconds.
  if (ts < 1000000000000) {
    ts *= 1000;
  }

  const date = new Date(ts);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const now = new Date();
  
  // If date is in the future, prefix with "Ends"
  const prefix = date > now ? "Ends " : "Ended ";
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${prefix}${date.toLocaleDateString(undefined, options)}`;
}

/**
 * Returns a short relative time string like "2m ago"
 */
export function formatTimeAgo(timestamp: number | string | undefined): string {
  if (!timestamp) return "just now";

  let ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (isNaN(ts)) return "unknown";

  if (ts < 1000000000000) {
    ts *= 1000;
  }

  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
