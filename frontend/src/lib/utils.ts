import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a friendly display: "Jan 31, 2026" */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy');
}

/** Format an ISO date string to a friendly time: "6:00 PM" */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a');
}

/** Format a date+time range: "Jan 31, 2026 • 6:00 PM – 7:00 PM" */
export function formatDateTimeRange(startIso: string, endIso: string): string {
  const date = formatDate(startIso);
  const startTime = formatTime(startIso);
  const endTime = formatTime(endIso);
  return `${date} • ${startTime} – ${endTime}`;
}

/** Compute age in years from a YYYY-MM-DD date string */
export function computeAge(dob: string): number {
  const birth = parseISO(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
