"use client";

import { PageInit } from "@/components/util/page/page-init";
import { ServiceForm } from "@/components/elements/design/service/service-form/service-form";
import { FormMode, Page } from "@/components/constants/enums";
import { useEffect, useState } from "react";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { ServiceFormState } from "@/models/services/ServiceEvent";

interface Props {
    params: {
        teamId: string;
        serviceId: string;
    }
}

export default function EditServicePage({ params }: Props) {
    const { teamId, serviceId } = params;
    const [schedule, setSchedule] = useState<ServiceFormState | undefined>(undefined);

    useEffect(() => {
        if (!schedule) {
            ServiceEventService.getServiceDetails(teamId, serviceId)
                .then(details => {
                    if (details && details.event) {
                        const adaptedSchedule: ServiceFormState = {
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
    }, [schedule, teamId, serviceId]);

    return (
        <div className="w-full h-full">
            <PageInit teamId={teamId} page={Page.EDIT_SERVING} />
            {schedule ? (
                <ServiceForm teamId={teamId} mode={FormMode.EDIT} initialData={schedule} />
            ) : (
                <div className="flex items-center justify-center h-full">Loading...</div>
            )}
        </div>
    );
}
