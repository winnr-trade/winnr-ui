import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function now(): number {
  return dayjs().valueOf();
}

/**
 * Formats a timestamp (ms) into a human readable date string like "Ends Dec 12"
 */
export function formatDate(timestampMs: number): string {
  const date = dayjs(timestampMs);
  const prefix = date.isAfter(dayjs()) ? "Ends " : "Ended ";
  return `${prefix}${date.format("MMM D")}`;
}

/**
 * Returns a short relative time string like "2m ago"
 */
export function formatTimeAgo(timestampMs: number): string {
  return dayjs(timestampMs).fromNow();
}

/**
 * Formats a timestamp into a full date string like "Dec 12, 2024"
 */
export function formatFullDate(timestampMs: number): string {
  return dayjs(timestampMs).format("MMM D, YYYY");
}

/**
 * Formats time until a future date like "2d : 5h"
 */
export function formatTimeUntil(timestampMs: number): string {
  const now = dayjs();
  const target = dayjs(timestampMs);
  const diffMs = target.diff(now);

  if (diffMs <= 0) return "Ended";

  const days = target.diff(now, "day");
  const hours = target.diff(now.add(days, "day"), "hour");

  if (days > 0) return `${days}d : ${hours}h`;
  return `${hours}h`;
}
