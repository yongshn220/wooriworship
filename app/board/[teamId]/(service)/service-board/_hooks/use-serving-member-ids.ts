import { ServingSchedule } from "@/models/serving";
import { useMemo } from "react";

export function useServingMemberIds(schedule: ServingSchedule | undefined | null): string[] {
    return useMemo(() => {
        if (!schedule) return [];
        return [
            ...(schedule.items?.flatMap(item => item.assignments.flatMap(a => a.memberIds)) || []),
            ...(schedule.worship_roles?.flatMap(a => a.memberIds) || []),
            ...(schedule.roles?.flatMap(r => r.memberIds) || [])
        ];
    }, [schedule]);
}
