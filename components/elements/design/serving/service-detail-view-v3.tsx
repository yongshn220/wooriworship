"use client";

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { ServiceEvent, ServiceSetlist, ServicePraiseAssignee, ServiceFlow } from "@/models/services/ServiceEvent";
import { User } from "@/models/user";
import { getDynamicDisplayTitle } from "@/components/util/helper/helper-functions";

// Parts
import { ServingInfoCard } from "./parts/serving-info-card";
import { SetlistCard } from "./parts/setlist-card";
import { WorshipTeamCard } from "./parts/worship-team-card";
import { ServiceOrderCard } from "./parts/service-order-card";
import { WorshipPlanPreviewDrawer } from "../worship/worship-plan-preview-drawer";

interface Props {
    teamId: string;
    event: ServiceEvent;
    setlist: ServiceSetlist | null;
    praiseAssignee: ServicePraiseAssignee | null;
    flow: ServiceFlow | null;
    members: User[]; // Resolved members for Assignee
    currentUserUid?: string | null;
}

export function ServiceDetailViewV3({
    teamId,
    event,
    setlist,
    praiseAssignee,
    flow,
    members,
    currentUserUid
}: Props) {
    const team = useRecoilValue(teamAtom(teamId));
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

    // Resolve Display Title
    const displayTitle = getDynamicDisplayTitle(
        event.tagId ? [event.tagId] : [],
        team?.service_tags,
        event.title
    );

    return (
        <div className="space-y-5 pb-24">
            {/* 1. Info Card */}
            <ServingInfoCard
                scheduleId={event.id}
                title={displayTitle}
                date={event.date}
                worshipId={null} // V3 uses separate Setlist
                teamId={teamId}
                onPreview={setPreviewWorshipId} // Keeps preview logic if we link V3 setlist to preview?
            />

            {/* 2. Set List (NEW) */}
            <SetlistCard setlist={setlist} />

            {/* 3. Praise Assignee (Renamed from Band) */}
            <WorshipTeamCard
                worshipRoles={praiseAssignee?.assignee || []} // Map V3 assignee to V2 worshipRoles prop
                roles={[]} // V3 might not use standalone roles prop if assignee objects are complete? 
                // WorshipTeamCard layout might depend on 'roles' (definitions). 
                // We pass empty array if not available, check Card implementation.
                members={members}
                currentUserUid={currentUserUid}
            />

            {/* 4. Service Flow */}
            <ServiceOrderCard
                items={flow?.items || []}
                members={members}
                currentUserUid={currentUserUid}
            />

            {/* Preview Drawer (Legacy or V3?) */}
            {/* If we want to preview the Setlist, we need V3 compatible drawer or adapter */}
            <WorshipPlanPreviewDrawer
                teamId={teamId}
                isOpen={!!previewWorshipId}
                onClose={() => setPreviewWorshipId(null)}
                worshipId={previewWorshipId}
            />
        </div>
    );
}
