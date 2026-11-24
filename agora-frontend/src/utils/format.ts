import type { ResourceType } from "../types/forum";

/** "just now", "5 minutes ago", "3 days ago", or a date for older items. */
export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];

  for (const [unitSeconds, name] of units) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) {
      if (name === "month" || name === "year") {
        return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
      }
      return `${value} ${name}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/** "Ama Owusu" -> "AO" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_NOTES: "Lecture Notes",
  PERSONAL_NOTES: "Personal Notes",
  PAST_QUESTION: "Past Questions",
  QUIZ: "Quiz",
  TEXTBOOK_CHAPTER: "Textbook Chapter",
  OTHER: "Other",
};

/** Normalises course codes the same way the backend does: "cs 201" -> "CS201". */
export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
