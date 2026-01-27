"use client";

import { PageInit } from "@/components/util/page/page-init";
import { ServingForm } from "@/components/elements/design/serving/serving-form/serving-form";
import { FormMode, Page } from "@/components/constants/enums";
import { useEffect, useState } from "react";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { ServingSchedule } from "@/models/serving";

interface Props {
    params: {
        teamId: string;
        servingId: string;
    }
}

export default function EditServingPage({ params }: Props) {
    const { teamId, servingId } = params;
    const [schedule, setSchedule] = useState<ServingSchedule | undefined>(undefined);

    useEffect(() => {
        if (!schedule) {
            ServiceEventService.getServiceDetails(teamId, servingId)
                .then(details => {
                    if (details && details.event) {
                        const adaptedSchedule: ServingSchedule = {
                            id: details.event.id,
                            teamId: details.event.teamId,
                            date: details.event.date,
                            title: details.event.title,
                            service_tags: details.event.tagId ? [details.event.tagId] : [],
                            worship_id: details.event.worship_id,
                            worship_roles: details.praiseAssignee?.assignee || [],
                            items: details.flow?.items || [],
                            roles: [],
                        };
                        setSchedule(adaptedSchedule);
                    }
                })
                .catch(console.error);
        }
    }, [schedule, teamId, servingId]);

    return (
        <div className="w-full h-full">
            <PageInit teamId={teamId} page={Page.EDIT_SERVING} />
            {schedule ? (
                <ServingForm teamId={teamId} mode={FormMode.EDIT} initialData={schedule} />
            ) : (
                <div className="flex items-center justify-center h-full">Loading...</div>
            )}
        </div>
    );
}
