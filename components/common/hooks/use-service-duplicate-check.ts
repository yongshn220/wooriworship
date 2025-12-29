import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FormMode } from "@/components/constants/enums";

interface UseServiceDuplicateCheckProps<T> {
    teamId: string;
    date: Date | undefined;
    tags: string[];
    mode: FormMode;
    currentId?: string; // ID of the item being edited (to exclude from duplicate check)
    fetcher: (teamId: string, startDate: string, endDate?: string) => Promise<T[]>; // Generic fetcher
    itemDateFormatter?: (date: Date) => string; // Optional custom date formatter
}

export function useServiceDuplicateCheck<T extends { id: string; tags?: string[] }>({
    teamId,
    date,
    tags,
    mode,
    currentId,
    fetcher,
    itemDateFormatter = (d) => format(d, 'yyyy-MM-dd')
}: UseServiceDuplicateCheckProps<T>) {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        const checkDuplicate = async () => {
            // Clear status if partial info
            if (!date || tags.length === 0) {
                setIsDuplicate(false);
                setErrorMessage(undefined);
                return;
            }

            setIsLoading(true);
            try {
                const dateStr = itemDateFormatter(date);

                // Fetch existing items for the date
                // Note: fetcher signature might vary slightly between services, so we might need to adapt.
                // But assumed standard is (teamId, dateStr, dateStr) or similar.
                // If fetcher takes single date, we pass same for start/end or just start.
                const existingItems = await fetcher(teamId, dateStr, dateStr);

                const duplicate = existingItems.find(item =>
                    tags.some(t => item.tags?.includes(t)) &&
                    (mode === FormMode.CREATE || (mode === FormMode.EDIT && item.id !== currentId))
                );

                const isDup = !!duplicate;
                setIsDuplicate(isDup);

                if (isDup) {
                    setErrorMessage(`"${dateStr} ${tags[0]}" already exists.`);
                } else {
                    setErrorMessage(undefined);
                }

            } catch (error) {
                console.error("Failed to check for duplicates", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkDuplicate();
    }, [date, tags, teamId, mode, currentId, fetcher, itemDateFormatter]);

    return { isDuplicate, isLoading, errorMessage };
}
