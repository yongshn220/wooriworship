"use client";

import { useRecoilValue } from "recoil";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { ServingForm } from "@/components/elements/design/serving/serving-form/serving-form";
import { FormMode } from "@/components/constants/enums";
import { useEffect, useState } from "react";
import { ServingService } from "@/apis";
import { ServingSchedule } from "@/models/serving";

interface Props {
    params: {
        teamId: string;
        servingId: string;
    }
}

export default function EditServingPage({ params }: Props) {
    const { teamId, servingId } = params;
    const allSchedules = useRecoilValue(servingSchedulesAtom);

    // Try to find in atom first, otherwise fetch?
    // Usually editing happens after viewing, so it might be in atom. 
    // But if refreshed on edit page, atom might be empty initially depending on hydration strategy.
    // The previous edit pages (like worship) used a selector or atom family.
    // Here I'll do a simple local state fallback.

    const scheduleFromAtom = allSchedules.find(s => s.id === servingId);
    const [schedule, setSchedule] = useState<ServingSchedule | undefined>(scheduleFromAtom);

    useEffect(() => {
        if (!schedule) {
            ServingService.getScheduleById(teamId, servingId)
                .then(s => {
                    if (s) setSchedule(s);
                })
                .catch(console.error);
        }
    }, [schedule, teamId, servingId]);

    // For now, if atomic state misses, I should fetch. But I need an API for ID.
    // Or I find it by iterating? No, firestore needs ID.
    // BaseService? No.

    // Modification: I need to add getScheduleById to ServingService.
    return (
        <div className="w-full h-full">
            {schedule ? (
                <ServingForm teamId={teamId} mode={FormMode.EDIT} initialData={schedule} />
            ) : (
                <div className="flex items-center justify-center h-full">Loading...</div>
            )}
        </div>
    );
}
