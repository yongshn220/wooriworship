import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FormMode } from "@/components/constants/enums";

interface UseServiceDuplicateCheckProps<T> {
    teamId: string;
    date: Date | undefined;
    serviceTagIds: string[];
    serviceTagNames?: string[];
    mode: FormMode;
    currentId?: string; // ID of the item being edited (to exclude from duplicate check)
    fetcher: (teamId: string, startDate: string, endDate?: string) => Promise<T[]>; // Generic fetcher
    itemDateFormatter?: (date: Date) => string; // Optional custom date formatter
    enabled?: boolean; // Set to false to suppress checks (e.g. during submission)
}

const defaultDateFormatter = (d: Date) => format(d, 'yyyy-MM-dd');

export function useServiceDuplicateCheck<T extends { id: string; tagId?: string; service_tags?: string[] }>({
    teamId,
    date,
    serviceTagIds,
    serviceTagNames,
    mode,
    currentId,
    fetcher,
    itemDateFormatter = defaultDateFormatter,
    enabled = true
}: UseServiceDuplicateCheckProps<T>) {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [duplicateId, setDuplicateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        const checkDuplicate = async () => {
            // Skip check when disabled (e.g. during submission)
            if (!enabled) {
                setIsDuplicate(false);
                setErrorMessage(undefined);
                return;
            }

            // Clear status if partial info
            if (!date || serviceTagIds.length === 0) {
                setIsDuplicate(false);
                setErrorMessage(undefined);
                return;
            }

            setIsLoading(true);
            try {
                const dateStr = itemDateFormatter(date);

                const existingItems = await fetcher(teamId, dateStr, dateStr);

                const duplicate = existingItems.find(item => {
                    const matchesTag = serviceTagIds.some((t: string) =>
                        item.tagId === t || item.service_tags?.includes(t)
                    );
                    return matchesTag && (mode === FormMode.CREATE || (mode === FormMode.EDIT && item.id !== currentId));
                });

                const isDup = !!duplicate;
                setIsDuplicate(isDup);
                setDuplicateId(duplicate ? duplicate.id : null);

                if (isDup) {
                    const tagName = serviceTagNames?.[0] || serviceTagIds[0];
                    setErrorMessage(`"${dateStr} ${tagName}" already exists.`);
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
    }, [date, serviceTagIds, teamId, mode, currentId, fetcher, itemDateFormatter, serviceTagNames, enabled]);
    return { isDuplicate, duplicateId: isDuplicate ? duplicateId : null, isLoading, errorMessage };
}
