import { useState, useEffect } from "react";
import { ServingService } from "@/apis";
import { ServingSchedule } from "@/models/serving";
import { getSuggestionsForTitle as domainGetSuggestions } from "../utils/serving-domain-logic";

export function useServingHistory(teamId: string, serviceTagIds: string[], teamMembers: any[]) {
    const [historySchedules, setHistorySchedules] = useState<ServingSchedule[]>([]);

    useEffect(() => {
        if (!teamId) {
            setHistorySchedules([]);
            return;
        }
        const fetchHistory = async () => {
            if (serviceTagIds.length > 0) {
                const recent = await ServingService.getRecentSchedulesByTag(teamId, serviceTagIds[0], 10);
                setHistorySchedules(recent);
            } else {
                const recent = await ServingService.getRecentSchedules(teamId, 10);
                setHistorySchedules(recent);
            }
        };
        fetchHistory();
    }, [teamId, serviceTagIds]);

    const getSuggestionsForTitle = (title: string) => domainGetSuggestions(title, historySchedules, teamMembers);

    return {
        historySchedules,
        getSuggestionsForTitle
    };
}
