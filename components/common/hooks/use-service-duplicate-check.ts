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
}

const defaultDateFormatter = (d: Date) => format(d, 'yyyy-MM-dd');

export function useServiceDuplicateCheck<T extends { id: string; service_tags?: string[] }>({
    teamId,
    date,
    serviceTagIds,
    serviceTagNames,
    mode,
    currentId,
    fetcher,
    itemDateFormatter = defaultDateFormatter
}: UseServiceDuplicateCheckProps<T>) {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [duplicateId, setDuplicateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        const checkDuplicate = async () => {
            // Clear status if partial info
            if (!date || serviceTagIds.length === 0) {
                setIsDuplicate(false);
                setErrorMessage(undefined);
                return;
            }

            // Prevent check if we are already in duplicate state and inputs haven't changed?
            // Actually, useEffect handles inputs.
            // But we should verify if the "duplicate" found is strictly not the current one.

            // Optimization: If mode is CREATE and we just submitted, do we need to check? 
            // We can't know submission state here easily. 
            // The unstable dependency fix (itemDateFormatter) should prevent re-runs during submission re-renders.

            setIsLoading(true);
            try {
                const dateStr = itemDateFormatter(date);

                const existingItems = await fetcher(teamId, dateStr, dateStr);

                const duplicate = existingItems.find(item =>
                    serviceTagIds.some((t: string) => item.service_tags?.includes(t)) &&
                    (mode === FormMode.CREATE || (mode === FormMode.EDIT && item.id !== currentId))
                );

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
    }, [date, serviceTagIds, teamId, mode, currentId, fetcher, itemDateFormatter, serviceTagNames]);
    return { isDuplicate, duplicateId: isDuplicate ? duplicateId : null, isLoading, errorMessage };
}
