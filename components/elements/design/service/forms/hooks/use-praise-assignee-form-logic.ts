import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServicePraiseTeam } from "@/models/services/ServiceEvent";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";
import PushNotificationApi from "@/apis/PushNotificationApi";
import { useServiceRoles } from "./use-service-roles";
import { usePraiseTeamTemplates } from "./use-praise-team-templates";
import { toast } from "@/components/ui/use-toast";
import { auth } from "@/firebase";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { getNewlyAddedMemberIds } from "@/components/util/helper/push-notification-helpers";


interface UsePraiseAssigneeFormLogicProps {
    teamId: string;
    serviceId: string;
    initialAssignee?: ServicePraiseTeam | null;
    serviceDate?: Timestamp;
    onCompleted: () => void;
}

export function usePraiseAssigneeFormLogic({ teamId, serviceId, initialAssignee, serviceDate, onCompleted }: UsePraiseAssigneeFormLogicProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Team Members
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // Reuse existing roles logic
    const {
        roles,
        praiseTeam,
        setPraiseTeam,
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        newRoleName,
        setNewRoleName,
        isCreatingRole,
        deleteConfirm,
        setDeleteConfirm,
        handleCreateRole,
        handleDeleteRole,
        handleAssignMemberToRole
    } = useServiceRoles(teamId);

    // Initialize Assignments
    useEffect(() => {
        if (initialAssignee?.assignments) {
            setPraiseTeam(initialAssignee.assignments);
        }
    }, [initialAssignee, setPraiseTeam]);

    // --- Praise Team Templates ---
    const {
        ptTemplates,
        isPtTemplatesLoaded,
        selectedPtTemplateId,
        setSelectedPtTemplateId,
        hasPtTemplateChanges,
        isPtTemplateDialogOpen,
        setIsPtTemplateDialogOpen,
        isPtRenameDialogOpen,
        setIsPtRenameDialogOpen,
        newPtTemplateName,
        setNewPtTemplateName,
        tempPtTemplateName,
        setTempPtTemplateName,
        handleSavePtTemplate,
        handleUpdatePtTemplate,
        handleDeletePtTemplate,
        handleUpdatePtTemplateName,
    } = usePraiseTeamTemplates(teamId, praiseTeam, setPraiseTeam);

    const [activeSelection, setActiveSelection] = useState<{ roleId: string } | null>(null);
    const [standardGroups, setStandardGroups] = useState<string[]>([]);
    const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);

    // Initialize Config (Groups & Custom Names)
    useEffect(() => {
        if (teamId) {
            PraiseTeamApi.getServiceConfig(teamId).then(config => {
                if (config.customGroups.length > 0) {
                    setStandardGroups(prev => Array.from(new Set([...prev, ...config.customGroups])));
                }
                if (config.customNames.length > 0) {
                    setCustomMemberNames(config.customNames);
                }
            }).catch(console.error);
        }
    }, [teamId]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await PraiseTeamApi.updatePraiseTeam(teamId, serviceId, {
                assignments: praiseTeam
            });
            toast({ title: "Team assignments saved!" });

            // Notify newly added members
            const newMembers = getNewlyAddedMemberIds(initialAssignee?.assignments, praiseTeam);
            if (newMembers.length > 0) {
                const url = `/board/${teamId}/service-board`;
                const dateStr = serviceDate ? format(serviceDate.toDate(), "yyyy/MM/dd") : "";
                PushNotificationApi.notifyNewlyAssignedMembers(
                    teamId, auth.currentUser?.uid || "", newMembers, dateStr, url
                ).catch(console.error);
            }

            onCompleted();
        } catch (error) {
            console.error("Failed to save praise assignments:", error);
            toast({ title: "Failed to save assignments", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // State
        isLoading,
        roles,
        praiseTeam,
        setPraiseTeam,

        // UI State
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        newRoleName,
        setNewRoleName,
        isCreatingRole,
        deleteConfirm,
        setDeleteConfirm,
        activeSelection,
        setActiveSelection,
        standardGroups,
        setStandardGroups,
        customMemberNames,
        setCustomMemberNames,
        team,
        teamMembers,

        // Actions
        handleCreateRole,
        handleDeleteRole,
        handleAssignMemberToRole,
        handleSave,

        // Praise Team Templates
        ptTemplates,
        isPtTemplatesLoaded,
        selectedPtTemplateId,
        setSelectedPtTemplateId,
        hasPtTemplateChanges,
        isPtTemplateDialogOpen,
        setIsPtTemplateDialogOpen,
        isPtRenameDialogOpen,
        setIsPtRenameDialogOpen,
        newPtTemplateName,
        setNewPtTemplateName,
        tempPtTemplateName,
        setTempPtTemplateName,
        handleSavePtTemplate,
        handleUpdatePtTemplate,
        handleDeletePtTemplate,
        handleUpdatePtTemplateName,
    };
}
