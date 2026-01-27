import { ServingSchedule } from "@/models/serving";
import { useCallback } from "react";

interface ReturnType {
    navigateNext: () => void;
    navigatePrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export function useServingNavigation(
    schedules: ServingSchedule[],
    currentId: string | null,
    onSelect: (id: string) => void
): ReturnType {
    const currentIndex = schedules.findIndex(s => s.id === currentId);

    const hasNext = currentIndex !== -1 && currentIndex < schedules.length - 1;
    const hasPrev = currentIndex > 0;

    const navigateNext = useCallback(() => {
        if (hasNext) {
            onSelect(schedules[currentIndex + 1].id);
        }
    }, [currentIndex, hasNext, schedules, onSelect]);

    const navigatePrev = useCallback(() => {
        if (hasPrev) {
            onSelect(schedules[currentIndex - 1].id);
        }
    }, [currentIndex, hasPrev, schedules, onSelect]);

    return {
        navigateNext,
        navigatePrev,
        hasNext,
        hasPrev
    };
}
