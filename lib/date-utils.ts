import { Timestamp } from "firebase/firestore";

/**
 * Safely converts a date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * to a local Date object without time-zone shifting for date-only strings.
 */
export function parseLocalDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    // If it's just YYYY-MM-DD, parse as local date
    if (dateStr.length === 10) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
}

/**
 * Gets a timezone-safe display Date from a ServiceEvent-like object.
 * Prefers date_string (creator's local date) over Timestamp conversion.
 * Fallback: Timestamp.toDate() for legacy documents without date_string.
 */
export function getServiceDisplayDate(event: { date_string?: string; date: Timestamp }): Date {
    if (event.date_string) {
        return parseLocalDate(event.date_string);
    }
    return event.date.toDate();
}
