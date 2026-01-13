import { useCallback } from "react";

interface ReturnType {
    navigateNext: () => void;
    navigatePrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Generic navigation hook for any list of items by ID
 */
export function useCalendarNavigation<T extends { id: string }>(
    items: T[],
    currentId: string | null,
    onSelect: (id: string) => void
): ReturnType {
    const currentIndex = items.findIndex(s => s.id === currentId);

    const hasNext = currentIndex !== -1 && currentIndex < items.length - 1;
    const hasPrev = currentIndex > 0;

    const navigateNext = useCallback(() => {
        // Next in array (Assuming array is sorted by Date ASC)
        // If sorting is DESC, this logic means "Go to Older" which might be "Swipe Left" or "Right" depending on UX.
        // Assuming visual order matches array order.
        if (hasNext) {
            onSelect(items[currentIndex + 1].id);
        }
    }, [currentIndex, hasNext, items, onSelect]);

    const navigatePrev = useCallback(() => {
        if (hasPrev) {
            onSelect(items[currentIndex - 1].id);
        }
    }, [currentIndex, hasPrev, items, onSelect]);

    return {
        navigateNext,
        navigatePrev,
        hasNext,
        hasPrev
    };
}
