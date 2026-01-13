export interface CalendarItem {
    id: string;
    /** Standardized Date object */
    date: Date;
    /** Display title for the card */
    title?: string;
    /** Helper text (e.g., "Worship Team", "3 roles") */
    description?: string;
    /** Label to show on the card (e.g., "Worship", "Event") */
    badgeLabel?: string;
    /** Custom properties for specific logic if needed, but try to avoid */
    originalData?: any;
}
