"use client";

import { Music, Users, ListOrdered } from "lucide-react";

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom, fetchServiceTagsSelector } from "@/global-states/teamState";
import { ServiceEvent, ServiceSetlist, ServicePraiseAssignee, ServiceFlow, ServiceRole } from "@/models/services/ServiceEvent";
import { User } from "@/models/user";
import { getDynamicDisplayTitle } from "@/components/util/helper/helper-functions";

// Parts
import { ServingInfoCard } from "./parts/serving-info-card";
import { SetlistSongListCard } from "@/components/elements/design/setlist/parts/setlist-song-list-card";
import { PraiseTeamCard } from "./parts/praise-team-card";
import { ServiceOrderCard } from "./parts/service-order-card";
import { SetlistPlanPreviewDrawer } from "@/components/elements/design/setlist/setlist-plan-preview-drawer";
import { PraiseAssigneeForm } from "./forms/praise-assignee-form";
import { ServiceFlowForm } from "./forms/service-flow-form";
import { SetlistForm } from "./forms/setlist-form";


interface Props {
    teamId: string;
    event: ServiceEvent;
    setlist: ServiceSetlist | null;
    praiseAssignee: ServicePraiseAssignee | null;
    flow: ServiceFlow | null;
    roles: ServiceRole[]; // Team's serving roles for display
    members: User[]; // Resolved members for Assignee
    currentUserUid?: string | null;
}

export function ServiceDetailView({
    teamId,
    event,
    setlist,
    praiseAssignee,
    flow,
    roles,
    members,
    currentUserUid
}: Props) {
    const team = useRecoilValue(teamAtom(teamId));
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const [previewSetlistId, setPreviewSetlistId] = useState<string | null>(null);
    const [isEditingSetlist, setIsEditingSetlist] = useState(false);
    const [isEditingAssignee, setIsEditingAssignee] = useState(false);
    const [isEditingFlow, setIsEditingFlow] = useState(false);

    // Resolve Display Title
    const displayTitle = getDynamicDisplayTitle(
        event.tagId ? [event.tagId] : [],
        serviceTags,
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
                onPreview={setPreviewSetlistId} // Keeps preview logic if we link V3 setlist to preview?
            />


            {/* 2. Set List */}
            {setlist && setlist.songs.length > 0 ? (
                <SetlistSongListCard
                    teamId={teamId}
                    songs={setlist.songs.map(s => ({
                        id: s.id,
                        title: s.title || "",
                        keys: s.key ? [s.key] : [],
                        original: { author: s.artist || "", url: "" },
                        team_id: teamId,
                        subtitle: "",
                        description: "",
                        tags: [],
                        bpm: 0,
                        version: "",
                        lyrics: "",
                        created_by: { id: "", time: { seconds: 0, nanoseconds: 0 } as any },
                        last_used_time: { seconds: 0, nanoseconds: 0 } as any,
                        updated_by: { id: "", time: { seconds: 0, nanoseconds: 0 } as any }
                    }))}
                    onEdit={() => setIsEditingSetlist(true)}
                />
            ) : (
                <div onClick={() => setIsEditingSetlist(true)} className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold">Create Setlist</h3>
                    <p className="text-sm text-muted-foreground">Add songs to this service</p>
                </div>
            )}

            {/* 3. Praise Assignee */}
            {praiseAssignee && praiseAssignee.assignee.length > 0 ? (
                <PraiseTeamCard
                    praiseAssignments={praiseAssignee.assignee}
                    roles={roles}
                    members={members}
                    currentUserUid={currentUserUid}
                    onEdit={() => setIsEditingAssignee(true)}
                />
            ) : (
                <div onClick={() => setIsEditingAssignee(true)} className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-base font-semibold">Assign Team</h3>
                    <p className="text-sm text-muted-foreground">Assign members for this service</p>
                </div>
            )}

            {/* 4. Service Flow */}
            {flow && flow.items.length > 0 ? (
                <ServiceOrderCard
                    items={flow.items}
                    members={members}
                    currentUserUid={currentUserUid}
                    onEdit={() => setIsEditingFlow(true)}
                />
            ) : (
                <div onClick={() => setIsEditingFlow(true)} className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ListOrdered className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-base font-semibold">Create Flow</h3>
                    <p className="text-sm text-muted-foreground">Add service sequence items</p>
                </div>
            )}

            {/* Preview Drawer (Legacy or V3?) */}
            <SetlistPlanPreviewDrawer
                teamId={teamId}
                isOpen={!!previewSetlistId}
                onClose={() => setPreviewSetlistId(null)}
                setlistId={previewSetlistId}
            />

            {/* Forms */}
            {isEditingSetlist && (
                <SetlistForm
                    teamId={teamId}
                    serviceId={event.id}
                    initialSetlist={setlist}
                    onCompleted={() => setIsEditingSetlist(false)}
                    onClose={() => setIsEditingSetlist(false)}
                />
            )}

            {isEditingAssignee && (
                <PraiseAssigneeForm
                    teamId={teamId}
                    serviceId={event.id}
                    initialAssignee={praiseAssignee}
                    onCompleted={() => setIsEditingAssignee(false)}
                    onClose={() => setIsEditingAssignee(false)}
                />
            )}

            {isEditingFlow && (
                <ServiceFlowForm
                    teamId={teamId}
                    serviceId={event.id}
                    initialFlow={flow}
                    serviceTagIds={event.tagId ? [event.tagId] : []}
                    onCompleted={() => setIsEditingFlow(false)}
                    onClose={() => setIsEditingFlow(false)}
                />
            )}
        </div>
    );
}
