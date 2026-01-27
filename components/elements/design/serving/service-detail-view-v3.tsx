"use client";

import { Music, Users, ListOrdered } from "lucide-react";

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom, fetchServiceTagsSelector } from "@/global-states/teamState";
import { ServiceEvent, ServiceSetlist, ServicePraiseAssignee, ServiceFlow } from "@/models/services/ServiceEvent";
import { User } from "@/models/user";
import { getDynamicDisplayTitle } from "@/components/util/helper/helper-functions";

// Parts
import { ServingInfoCard } from "./parts/serving-info-card";
import { WorshipSongListCard } from "../worship/parts/worship-song-list-card";
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
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

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
                onPreview={setPreviewWorshipId} // Keeps preview logic if we link V3 setlist to preview?
            />

            {/* 2. Set List */}
            {setlist && setlist.songs.length > 0 ? (
                <WorshipSongListCard
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
                />
            ) : (
                <div onClick={() => setPreviewWorshipId("edit_mode")} className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6 text-primary" />
                    </div>
                    {/* Note: Icons import checking needed. Music imported from lucide-react? */}
                    <h3 className="text-base font-semibold">Create Setlist</h3>
                    <p className="text-sm text-muted-foreground">Add songs to this service</p>
                </div>
            )}

            {/* 3. Praise Assignee */}
            {praiseAssignee && praiseAssignee.assignee.length > 0 ? (
                <WorshipTeamCard
                    worshipRoles={praiseAssignee.assignee}
                    roles={[]}
                    members={members}
                    currentUserUid={currentUserUid}
                />
            ) : (
                <div className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
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
                />
            ) : (
                <div className="group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ListOrdered className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-base font-semibold">Create Flow</h3>
                    <p className="text-sm text-muted-foreground">Add service sequence items</p>
                </div>
            )}

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
