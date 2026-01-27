import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServicePraiseAssignee } from "@/models/services/ServiceEvent";
import { PraiseAssigneeService } from "@/apis/PraiseAssigneeService";
import { useServiceRoles } from "../../service-form/hooks/use-service-roles";
import { toast } from "@/components/ui/use-toast";


interface UsePraiseAssigneeFormLogicProps {
    teamId: string;
    serviceId: string;
    initialAssignee?: ServicePraiseAssignee | null;
    onCompleted: () => void;
}

export function usePraiseAssigneeFormLogic({ teamId, serviceId, initialAssignee, onCompleted }: UsePraiseAssigneeFormLogicProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Team Members
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // Reuse existing roles logic
    const {
        roles,
        worshipRoles,
        setWorshipRoles,
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
        if (initialAssignee?.assignee) {
            setWorshipRoles(initialAssignee.assignee);
        }
    }, [initialAssignee, setWorshipRoles]);

    const [activeSelection, setActiveSelection] = useState<{ roleId: string } | null>(null);
    const [standardGroups, setStandardGroups] = useState<string[]>([]);
    const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);

    // Initialize Config (Groups & Custom Names)
    useEffect(() => {
        if (teamId) {
            PraiseAssigneeService.getServingConfig(teamId).then(config => {
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
            await PraiseAssigneeService.updateAssignees(teamId, serviceId, {
                assignee: worshipRoles
            });
            toast({ title: "Team assignments saved!" });
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
        worshipRoles,

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
        handleSave
    };
}
