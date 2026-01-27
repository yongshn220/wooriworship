import { useState, useEffect } from "react";
import { ServiceEventService } from "@/apis/ServiceEventService";
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
            const recent = await ServiceEventService.getRecentServicesWithFlows(
                teamId,
                serviceTagIds.length > 0 ? serviceTagIds[0] : undefined,
                10
            );
            setHistorySchedules(recent);
        };
        fetchHistory();
    }, [teamId, serviceTagIds]);

    const getSuggestionsForTitle = (title: string) => domainGetSuggestions(title, historySchedules, teamMembers);

    return {
        historySchedules,
        getSuggestionsForTitle
    };
}
