"use client";

import { FileMusic, Users, Hash } from "lucide-react";
import { ServiceTodoCard } from "./parts/service-todo-card";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { teamAtom, fetchServiceTagsSelector } from "@/global-states/teamState";
import { ServiceEvent, ServiceSetlist, ServicePraiseTeam, ServiceFlow, ServiceRole } from "@/models/services/ServiceEvent";
import { MyAssignmentRole } from "@/models/services/MyAssignment";
import { User } from "@/models/user";
import { getDynamicDisplayTitle } from "@/components/util/helper/helper-functions";
import { SetlistApi } from "@/apis/SetlistApi";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";
import { ServiceFlowApi } from "@/apis/ServiceFlowApi";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { DownloadSetlistSheetsDrawer } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_components/download-setlist-sheets-drawer";
import { useToast } from "@/components/ui/use-toast";
import { getPathSetlistView } from "@/components/util/helper/routes";

// Parts
import { ServiceInfoCard } from "./parts/service-info-card";
import { SetlistSongListCard } from "@/components/elements/design/setlist/parts/setlist-song-list-card";
import { PraiseTeamCard } from "./parts/praise-team-card";
import { ServiceOrderCard } from "./parts/service-order-card";
import { SetlistPlanPreviewDrawer } from "@/components/elements/design/setlist/setlist-plan-preview-drawer";
import { PraiseAssigneeForm } from "./forms/praise-assignee-form";
import { ServiceFlowForm } from "./forms/service-flow-form";
import { SetlistForm } from "./forms/setlist-form";
import { EmptyStateCard } from "@/components/elements/design/common/empty-state-card";


interface Props {
    teamId: string;
    event: ServiceEvent;
    setlist: ServiceSetlist | null;
    praiseAssignee: ServicePraiseTeam | null;
    flow: ServiceFlow | null;
    roles: ServiceRole[]; // Team's serving roles for display
    members: User[]; // Resolved members for Assignee
    currentUserUid?: string | null;
    onDataChanged?: () => void; // Callback to refetch data after form saves
    myRoles?: MyAssignmentRole[];
}

export function ServiceDetailView({
    teamId,
    event,
    setlist,
    praiseAssignee,
    flow,
    roles,
    members,
    currentUserUid,
    onDataChanged,
    myRoles
}: Props) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const [previewSetlistId, setPreviewSetlistId] = useState<string | null>(null);
    const [isEditingSetlist, setIsEditingSetlist] = useState(false);
    const [isEditingAssignee, setIsEditingAssignee] = useState(false);
    const [isEditingFlow, setIsEditingFlow] = useState(false);
    const { toast } = useToast();
    const [deletingTarget, setDeletingTarget] = useState<"setlist" | "assignee" | "flow" | null>(null);
    const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] = useState(false);

    const handleDeleteSetlist = async () => {
        await SetlistApi.deleteSetlist(teamId, event.id);
        toast({ title: "Setlist deleted" });
        onDataChanged?.();
    };

    const handleDeleteAssignee = async () => {
        await PraiseTeamApi.deletePraiseTeam(teamId, event.id);
        toast({ title: "Praise team deleted" });
        onDataChanged?.();
    };

    const handleDeleteFlow = async () => {
        await ServiceFlowApi.deleteFlow(teamId, event.id);
        toast({ title: "Service flow deleted" });
        onDataChanged?.();
    };

    // Resolve Display Title
    const displayTitle = getDynamicDisplayTitle(
        event.tagId ? [event.tagId] : [],
        serviceTags,
        event.title
    );

    return (
        <div className="space-y-5 pb-24" data-testid="service-detail">
            {/* 1. Info Card */}
            <ServiceInfoCard
                scheduleId={event.id}
                title={displayTitle}
                date={event.date}
                setlistId={null} // V3 uses separate Setlist
                teamId={teamId}
                onPreview={setPreviewSetlistId}
                myRoles={myRoles}
                tagId={event.tagId}
                onEdited={onDataChanged}
            />


            {/* 2. Set List */}
            {setlist && setlist.songs.length > 0 ? (
                <SetlistSongListCard
                    teamId={teamId}
                    songs={setlist.songs.map(s => ({
                        id: s.id,
                        title: s.title || "",
                        key: s.key || "",
                        keyNote: s.keyNote || ""
                    }))}
                    onEdit={() => setIsEditingSetlist(true)}
                    onDownload={() => setIsDownloadDrawerOpen(true)}
                    onDelete={() => setDeletingTarget("setlist")}
                    onSetlistView={() => router.push(getPathSetlistView(teamId, event.id))}
                />
            ) : (
                <EmptyStateCard
                    onClick={() => setIsEditingSetlist(true)}
                    icon={FileMusic}
                    iconColorClassName="bg-primary/10 text-primary"
                    message="Create Setlist"
                    description="Add songs to this service"
                    data-testid="create-setlist-placeholder"
                />
            )}

            {/* 3. Praise Assignee */}
            {praiseAssignee && praiseAssignee.assignments && praiseAssignee.assignments.length > 0 ? (
                <PraiseTeamCard
                    praiseAssignments={praiseAssignee.assignments}
                    roles={roles}
                    members={members}
                    currentUserUid={currentUserUid}
                    onEdit={() => setIsEditingAssignee(true)}
                    onDelete={() => setDeletingTarget("assignee")}
                />
            ) : (
                <EmptyStateCard
                    onClick={() => setIsEditingAssignee(true)}
                    icon={Users}
                    iconColorClassName="bg-blue-500/10 text-blue-500"
                    message="Assign Team"
                    description="Assign members for this service"
                    data-testid="create-team-placeholder"
                />
            )}

            {/* 4. Service Flow */}
            {flow && flow.items.length > 0 ? (
                <ServiceOrderCard
                    items={flow.items}
                    members={members}
                    currentUserUid={currentUserUid}
                    onEdit={() => setIsEditingFlow(true)}
                    onDelete={() => setDeletingTarget("flow")}
                />
            ) : (
                <EmptyStateCard
                    onClick={() => setIsEditingFlow(true)}
                    icon={Hash}
                    iconColorClassName="bg-orange-500/10 text-orange-500"
                    message="Create Flow"
                    description="Add service sequence items"
                    data-testid="create-flow-placeholder"
                />
            )}

            {/* 5. Tasks */}
            <ServiceTodoCard
                teamId={teamId}
                serviceId={event.id}
                serviceTitle={displayTitle}
                serviceDate={event.date}
            />

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
                    onCompleted={() => {
                        onDataChanged?.();
                        setIsEditingSetlist(false);
                    }}
                    onClose={() => setIsEditingSetlist(false)}
                />
            )}

            {isEditingAssignee && (
                <PraiseAssigneeForm
                    teamId={teamId}
                    serviceId={event.id}
                    initialAssignee={praiseAssignee}
                    onCompleted={() => {
                        onDataChanged?.();
                        setIsEditingAssignee(false);
                    }}
                    onClose={() => setIsEditingAssignee(false)}
                />
            )}

            {isEditingFlow && (
                <ServiceFlowForm
                    teamId={teamId}
                    serviceId={event.id}
                    initialFlow={flow}
                    serviceTagIds={event.tagId ? [event.tagId] : []}
                    onCompleted={() => {
                        onDataChanged?.();
                        setIsEditingFlow(false);
                    }}
                    onClose={() => setIsEditingFlow(false)}
                />
            )}

            {/* Delete Confirmation Dialogs */}
            <DeleteConfirmationDialog
                isOpen={deletingTarget === "setlist"}
                setOpen={(open) => !open && setDeletingTarget(null)}
                title="Delete Setlist?"
                description="All songs in this setlist will be removed. This action cannot be undone."
                onDeleteHandler={handleDeleteSetlist}
            />
            <DeleteConfirmationDialog
                isOpen={deletingTarget === "assignee"}
                setOpen={(open) => !open && setDeletingTarget(null)}
                title="Delete Praise Team?"
                description="All team assignments will be removed. This action cannot be undone."
                onDeleteHandler={handleDeleteAssignee}
            />
            <DeleteConfirmationDialog
                isOpen={deletingTarget === "flow"}
                setOpen={(open) => !open && setDeletingTarget(null)}
                title="Delete Service Flow?"
                description="All flow items will be removed. This action cannot be undone."
                onDeleteHandler={handleDeleteFlow}
            />

            {/* Download Setlist Sheets Drawer */}
            <DownloadSetlistSheetsDrawer
                teamId={teamId}
                serviceId={event.id}
                open={isDownloadDrawerOpen}
                onOpenChange={setIsDownloadDrawerOpen}
            />
        </div>
    );
}
