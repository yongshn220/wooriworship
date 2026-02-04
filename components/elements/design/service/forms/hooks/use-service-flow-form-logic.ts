
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServiceFlow } from "@/models/services/ServiceEvent";
import { ServiceFlowApi } from "@/apis/ServiceFlowApi";
import PushNotificationApi from "@/apis/PushNotificationApi";
import { useServiceTimeline } from "./use-service-timeline";
import { useServiceTemplates } from "./use-service-templates";
import { useServiceHistory } from "./use-service-history";
import { toast } from "@/components/ui/use-toast";
import { auth } from "@/firebase";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { getNewlyAddedMemberIdsFromFlowItems } from "@/components/util/helper/push-notification-helpers";


interface UseServiceFlowFormLogicProps {
    teamId: string;
    serviceId: string;
    initialFlow?: ServiceFlow | null;
    serviceTagIds?: string[];
    serviceDate?: Timestamp;
    onCompleted: () => void;
}

export function useServiceFlowFormLogic({ teamId, serviceId, initialFlow, serviceTagIds = [], serviceDate, onCompleted }: UseServiceFlowFormLogicProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Team Members (for suggestions & timeline assignments)
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // 1. Timeline Items Logic
    const {
        items,
        setItems,
        activeSelection,
        setActiveSelection,
        standardGroups,
        setStandardGroups,
        customMemberNames,
        setCustomMemberNames,
        handleAddMember,
        newGroupInput,
        setNewGroupInput
    } = useServiceTimeline(teamId);

    // 2. Templates Logic
    const {
        templates,
        isTemplatesLoaded,
        selectedTemplateId,
        setSelectedTemplateId,
        hasTemplateChanges,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isRenameDialogOpen,
        setIsRenameDialogOpen,
        newTemplateName,
        setNewTemplateName,
        tempTemplateName,
        setTempTemplateName,
        createEmptyMode,
        setCreateEmptyMode,
        handleSaveTemplate,
        handleUpdateTemplate,
        handleDeleteTemplate,
        handleUpdateTemplateName,
        setTemplates,
        setIsTemplatesLoaded,
        setHasTemplateChanges
    } = useServiceTemplates(teamId, items, setItems);

    // 3. History & Suggestions
    const { getSuggestionsForTitle } = useServiceHistory(teamId, serviceTagIds, teamMembers);

    // Initialize Flow
    useEffect(() => {
        if (initialFlow?.items) {
            setItems(initialFlow.items);
        }
    }, [initialFlow, setItems]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await ServiceFlowApi.updateFlow(teamId, serviceId, {
                items: items
            });
            toast({ title: "Service flow saved!" });

            // Notify newly added members
            const newMembers = getNewlyAddedMemberIdsFromFlowItems(initialFlow?.items, items);
            if (newMembers.length > 0) {
                const url = `/board/${teamId}/service-board`;
                const dateStr = serviceDate ? format(serviceDate.toDate(), "yyyy/MM/dd") : "";
                PushNotificationApi.notifyNewlyAssignedMembers(
                    teamId, auth.currentUser?.uid || "", newMembers, dateStr, url
                ).catch(console.error);
            }

            onCompleted();
        } catch (error) {
            console.error("Failed to save service flow:", error);
            toast({ title: "Failed to save flow", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        items,
        setItems,

        // Timeline State
        activeSelection,
        setActiveSelection,
        standardGroups,
        customMemberNames,
        handleAddMember,
        setStandardGroups,
        setCustomMemberNames,

        // Templates State
        templates,
        isTemplatesLoaded,
        selectedTemplateId,
        setSelectedTemplateId,
        hasTemplateChanges,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isRenameDialogOpen,
        setIsRenameDialogOpen,
        newTemplateName,
        setNewTemplateName,
        tempTemplateName,
        setTempTemplateName,
        createEmptyMode,
        setCreateEmptyMode,

        // Team
        teamMembers,

        // Actions
        handleSaveTemplate,
        handleUpdateTemplate,
        handleDeleteTemplate,
        handleUpdateTemplateName,
        handleSave,
        getSuggestionsForTitle
    };
}
