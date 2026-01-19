"use client";

import { useState } from "react";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { User } from "@/models/user";
import { teamAtom } from "@/global-states/teamState";
import { useRecoilValue } from "recoil";
import { getDynamicDisplayTitle } from "@/components/util/helper/helper-functions";
import { ServingInfoCard } from "./parts/serving-info-card";
import { WorshipTeamCard } from "./parts/worship-team-card";
import { ServiceOrderCard } from "./parts/service-order-card";
import { WorshipPlanPreviewDrawer } from "../worship/worship-plan-preview-drawer";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
    teamId: string;
}

export function ServingDetailView({ schedule, roles, members, currentUserUid, teamId }: Props) {
    const team = useRecoilValue(teamAtom(teamId));
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

    const hasWorshipRoles = schedule.worship_roles && schedule.worship_roles.length > 0;
    const hasItems = schedule.items && schedule.items.length > 0;

    // Resolve Display Title
    const displayTitle = getDynamicDisplayTitle(schedule.service_tags, team?.service_tags, schedule.title);

    return (
        <div className="space-y-5 pb-24">
            {/* Info Card Component */}
            <ServingInfoCard
                scheduleId={schedule.id}
                title={displayTitle}
                date={schedule.date}
                worshipId={schedule.worship_id}
                teamId={teamId}
                onPreview={setPreviewWorshipId}
            />

            {/* Worship Team Section */}
            <WorshipTeamCard
                worshipRoles={schedule.worship_roles || []}
                roles={roles}
                members={members}
                currentUserUid={currentUserUid}
            />

            {/* Service Order Section */}
            <ServiceOrderCard
                items={schedule.items || []}
                members={members}
                currentUserUid={currentUserUid}
            />

            {/* Empty State / Fallback */}
            {!hasWorshipRoles && !hasItems && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                    <p className="text-sm text-slate-500">No details available for this schedule.</p>
                </div>
            )}

            {/* Preview Drawer */}
            {/* Preview Drawer */}
            <WorshipPlanPreviewDrawer
                teamId={teamId}
                isOpen={!!previewWorshipId}
                onClose={() => setPreviewWorshipId(null)}
                worshipId={previewWorshipId}
            />
        </div>
    );
}
