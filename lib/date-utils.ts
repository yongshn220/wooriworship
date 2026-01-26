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
