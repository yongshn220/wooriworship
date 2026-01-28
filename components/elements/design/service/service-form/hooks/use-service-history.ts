import { useState, useEffect } from "react";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { getSuggestionsForTitle as domainGetSuggestions } from "../utils/service-domain-logic";

export function useServiceHistory(teamId: string, serviceTagIds: string[], teamMembers: any[]) {
    const [historySchedules, setHistorySchedules] = useState<ServiceFormState[]>([]);

    useEffect(() => {
        if (!teamId) {
            setHistorySchedules([]);
            return;
        }
        const fetchHistory = async () => {
            const recent = await ServiceEventApi.getRecentServicesWithFlows(
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
