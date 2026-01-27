import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { teamAtom } from "@/global-states/teamState";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { usersAtom } from "@/global-states/userState";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { SetlistService } from "@/apis/SetlistService";
import { PraiseAssigneeService } from "@/apis/PraiseAssigneeService";
import { ServiceFlowService } from "@/apis/ServiceFlowService";
import LinkingService from "@/apis/LinkingService";
import PushNotificationService from "@/apis/PushNotificationService";
import { auth } from "@/firebase";
import { getPathServing } from "@/components/util/helper/routes";
import { FormMode } from "@/components/constants/enums";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";
import { ServingFormProps } from "../types";
import { ServingSchedule, ServingItem, ServingAssignment } from "@/models/serving";
import { getServiceTitleFromTags, parseLocalDate } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { ServiceEvent } from "@/models/services/ServiceEvent";

// Import Split Hooks
import { useServingRoles } from "./use-serving-roles";
import { useServingTemplates } from "./use-serving-templates";
import { useServingTimeline } from "./use-serving-timeline";
import { useServingHistory } from "./use-serving-history";

export function useServingFormLogic({ teamId, mode = FormMode.CREATE, initialData }: ServingFormProps) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);

    // --- 1. Roles Logic ---
    const {
        roles,
        setRoles,
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
        handleDeleteRole: baseHandleDeleteRole,
        handleAssignMemberToRole
    } = useServingRoles(teamId);

    // --- 2. Timeline items Logic ---
    const {
        items,
        setItems,
        activeSelection,
        setActiveSelection,
        standardGroups,
        setStandardGroups,
        customMemberNames,
        setCustomMemberNames,
        newGroupInput,
        setNewGroupInput,
        handleAddMember
    } = useServingTimeline(teamId);

    // --- 3. Templates Logic ---
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
    } = useServingTemplates(teamId, items, setItems);


    // --- 4. Main Form State (Date/Steps) ---
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const totalSteps = 4;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [serviceTagIds, setServiceTagIds] = useState<string[]>([]);

    // --- 5. Worship Linking ---
    const [availableWorships, setAvailableWorships] = useState<any[]>([]);
    const [linkedWorshipId, setLinkedWorshipId] = useState<string | null>(null);
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // --- 6. History & Suggestions ---
    const { historySchedules, getSuggestionsForTitle } = useServingHistory(teamId, serviceTagIds, teamMembers);

    // --- Initialization Logic ---


    // Auto-load Template (CREATE Mode)
    useEffect(() => {
        if (mode === FormMode.CREATE && items.length === 0 && templates.length > 0 && !selectedTemplateId) {
            // Logic to find last used is now inside useServingTemplates initialization? 
            // We'll skip complex logic, rely on 'Last Used' below
        }
    }, [mode, items.length, templates, selectedTemplateId]);

    // Initialize Last Used Template (One-time)
    // NOTE: ServiceEventService/ServiceEvent does not currently track templateId used.
    // Disabling this feature for V3 transition to focus on core functionality.
    /*
    useEffect(() => {
        if (teamId && mode === FormMode.CREATE && !selectedTemplateId) {
            ServingService.getRecentSchedules(teamId, 5).then(latest => {
                const lastUsed = latest.find(s => s.templateId)?.templateId;
                if (lastUsed) setSelectedTemplateId(lastUsed);
                else if (templates.length > 0) setSelectedTemplateId(templates[0].id);
            });
        }
    }, [teamId, mode, templates, selectedTemplateId, setSelectedTemplateId]);
    */

    // Apply Template when ID changes (Create Mode only mainly)
    useEffect(() => {
        if (mode === FormMode.CREATE && items.length === 0 && selectedTemplateId) {
            const templateToLoad = templates.find(t => t.id === selectedTemplateId);
            if (templateToLoad) {
                setItems(templateToLoad.items.map((item: any, idx: number) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    order: idx,
                    title: item.title,
                    remarks: item.remarks,
                    assignments: [] as ServingAssignment[],
                    type: item.type,
                })));
            }
        }
    }, [mode, selectedTemplateId, templates, items.length, setItems]);


    // Initialize Data (EDIT Mode)
    const isInitialDataLoaded = useRef(false);
    useEffect(() => {
        if (mode === FormMode.EDIT && initialData && !isInitialDataLoaded.current && roles.length > 0) {
            let parsedDate: Date;
            if (initialData.date instanceof Timestamp) {
                parsedDate = initialData.date.toDate();
            } else {
                parsedDate = parseLocalDate(initialData.date);
            }
            setSelectedDate(parsedDate);
            setCurrentMonth(parsedDate);
            setServiceTagIds(initialData.service_tags || []);

            // Set Linked Worship
            if (initialData.worship_id) setLinkedWorshipId(initialData.worship_id);

            // Set Template ID if exists
            if (initialData.templateId) setSelectedTemplateId(initialData.templateId);

            // Load Flow Items (Strict separation)
            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items.filter(i => (i as any).type !== 'WORSHIP_TEAM'));
            }

            // Load Roles
            if (initialData.worship_roles && initialData.worship_roles.length > 0) {
                setWorshipRoles(initialData.worship_roles);
            } else if (initialData.items) {
                const oldRolesItem = initialData.items.find(i => (i as any).type === 'WORSHIP_TEAM');
                if (oldRolesItem?.assignments) {
                    setWorshipRoles(oldRolesItem.assignments);
                } else if (initialData.roles) {
                    const migratedRoles = initialData.roles.map(r => ({ roleId: r.roleId, memberIds: r.memberIds }));
                    setWorshipRoles(migratedRoles);
                }
            }

            isInitialDataLoaded.current = true;
        }
    }, [mode, initialData, roles, setItems, setWorshipRoles, setSelectedTemplateId]);


    // Fetch available worship plans
    useEffect(() => {
        if (selectedDate && teamId) {
            ServiceEventService.getLegacyWorshipsByDate(teamId, selectedDate).then(worships => {
                const filteredWorships = worships.filter(w =>
                    serviceTagIds.some(t => w.service_tags?.includes(t)) ||
                    (mode === FormMode.EDIT && w.id === initialData?.worship_id)
                );

                setAvailableWorships(filteredWorships);

                const currentSelectionExists = filteredWorships.some(w => w.id === linkedWorshipId);

                if (currentSelectionExists) {
                    // Keep
                } else if (filteredWorships.length > 0) {
                    setLinkedWorshipId(filteredWorships[0].id);
                } else {
                    setLinkedWorshipId(null);
                }
            });
        } else {
            setAvailableWorships([]);
            setLinkedWorshipId(null);
        }
    }, [selectedDate, teamId, mode, initialData, serviceTagIds, linkedWorshipId]);

    // Duplicate Check using ServiceEventService
    const serviceTagNames = serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id);
    const { isDuplicate, duplicateId, errorMessage: duplicateErrorMessage } = useServiceDuplicateCheck({
        teamId,
        date: selectedDate,
        serviceTagIds,
        serviceTagNames,
        mode,
        currentId: initialData?.id,
        fetcher: async (tid, start, end) => {
            const s = parseLocalDate(start);
            const e = end ? parseLocalDate(end) : s;
            e.setHours(23, 59, 59);
            // Cast to any or adapted type that satisfies useServiceDuplicateCheck T
            const services = await ServiceEventService.getServiceEvents(tid, s, e);
            return services as unknown as { id: string, service_tags?: string[] }[];
        }
    });


    // Wrapped Actions
    const handleDeleteRole = (roleId: string) => {
        baseHandleDeleteRole(roleId, (deletedId) => {
            // Clean up from worshipRoles
            setWorshipRoles(prev => prev.filter(a => a.roleId !== deletedId));
        });
    };

    const handleSubmit = async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        try {
            const dateTimestamp = Timestamp.fromDate(selectedDate);
            const title = getServiceTitleFromTags(serviceTagIds, team?.service_tags);

            // Prepare Service Data (V3)
            const serviceData: Partial<ServiceEvent> = {
                teamId,
                date: dateTimestamp,
                title,
                tagId: serviceTagIds[0] || "",
                worship_id: linkedWorshipId || undefined
            };

            let targetServiceId: string;

            if (mode === FormMode.CREATE) {
                // 1. Create Core Service
                targetServiceId = await ServiceEventService.createService(teamId, serviceData);

                // 2. Parallel Updates for Sub-Collections
                await Promise.all([
                    SetlistService.updateSetlist(teamId, targetServiceId, { songs: [] }), // Setlist empty init or from worship? 
                    // Actually, if created from template, items are in flow. 
                    // Setlist is separate. In Form V3, Setlist might be linked or managed separately.
                    // For now, init empty setlist unless linked.
                    PraiseAssigneeService.updateAssignees(teamId, targetServiceId, { assignee: worshipRoles }),
                    ServiceFlowService.updateFlow(teamId, targetServiceId, { items: items })
                ]);

                // 3. Link Worship Request IF selected during create (Worship plan select)
                if (linkedWorshipId) {
                    await LinkingService.linkWorshipAndServing(teamId, linkedWorshipId, targetServiceId);
                }

                // 4. Notify & Stats
                const allAssignedMembers = Array.from(new Set([
                    ...items.flatMap(item => item.assignments.flatMap(a => a.memberIds)),
                    ...worshipRoles.flatMap(r => r.memberIds)
                ]));
                await PushNotificationService.notifyMembersServingAssignment(
                    teamId,
                    auth.currentUser?.uid || "",
                    selectedDate,
                    allAssignedMembers
                );

                // Keep Stats Logic
                if (serviceTagIds.length > 0) {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    await ServiceEventService.updateTagStats(teamId, serviceTagIds, dateStr, "add");
                }

                toast({ title: "Service created!" });
            } else {
                if (!initialData) return;
                targetServiceId = initialData.id;

                // 1. Update Core
                await ServiceEventService.updateService(teamId, targetServiceId, serviceData);

                // 2. Update Sub-collections
                await Promise.all([
                    // Full update: Setlist is not currently editable in this specific ServingForm (V3 plan separate)
                    // But for consistency let's keep sub-services.
                    PraiseAssigneeService.updateAssignees(teamId, targetServiceId, { assignee: worshipRoles }),
                    ServiceFlowService.updateFlow(teamId, targetServiceId, { items: items })
                ]);

                // 3. Update Link
                if (linkedWorshipId !== initialData.worship_id) {
                    if (initialData.worship_id) {
                        await LinkingService.unlinkWorship(teamId, initialData.worship_id);
                    }
                    if (linkedWorshipId) {
                        await LinkingService.linkWorshipAndServing(teamId, linkedWorshipId, targetServiceId);
                    }
                }

                // Stats Logic
                // If tags changed, remove old, add new
                // Simplified: just add new for now to avoid complexity in this migration refactor
                // Or better: Use ServingService's updateTagStats if we can track old tags. 
                // initialData.service_tags vs serviceTagIds.
                const oldTags = initialData.service_tags || [];
                // naive check
                if (JSON.stringify(oldTags) !== JSON.stringify(serviceTagIds)) {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    if (oldTags.length) await ServiceEventService.updateTagStats(teamId, oldTags, dateStr, "remove");
                    if (serviceTagIds.length) await ServiceEventService.updateTagStats(teamId, serviceTagIds, dateStr, "add");
                }

                toast({ title: "Service updated!" });
            }

            // Refresh logic: We rely on Navigation / SWR or Recoil.
            // If we use atom, we need to adapt new service back to old schedule format for Recoil?
            // "ServiceEvent" (V3) -> "ServingSchedule" (V1/V2 Adapter)
            // Or just invalidate/refetch.
            // For now, let's skip atom update if it's too complex or adapt it manually.
            // The list page uses ServiceEventService to fetch, so it should be fine on next fetch.
            // But if we want instant UI feedback, we can try adapting.

            // Since we are moving away from servingSchedulesAtom (which holds legacy arrays), 
            // and maybe moving to a new atom or SWR, let's just push route.
            router.push(getPathServing(teamId));

        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save service", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const goToStep = (targetStep: number) => {
        if (targetStep > 0 && !selectedDate) {
            toast({ title: "Please select a date first" });
            return;
        }
        setDirection(targetStep > step ? 1 : -1);
        setStep(targetStep);
    };


    return {
        // State
        step, direction, totalSteps,
        selectedDate, currentMonth, serviceTagIds, items,
        templates, isTemplatesLoaded, selectedTemplateId, hasTemplateChanges,
        availableWorships, linkedWorshipId, previewWorshipId,
        activeSelection, isLoading,
        isRoleDialogOpen, newRoleName, isCreatingRole, isTemplateDialogOpen, isRenameDialogOpen,
        newTemplateName, tempTemplateName, createEmptyMode,
        standardGroups, customMemberNames, newGroupInput, deleteConfirm,
        roles, team, teamMembers, historySchedules,
        isDuplicate, duplicateId, duplicateErrorMessage,
        worshipRoles, // Added worshipRoles to return

        // Setters
        setStep, setDirection, setSelectedDate, setCurrentMonth, setServiceTagIds, setItems,
        setTemplates, setIsTemplatesLoaded, setSelectedTemplateId, setHasTemplateChanges,
        setAvailableWorships, setLinkedWorshipId, setPreviewWorshipId, setActiveSelection, setIsLoading,
        setIsRoleDialogOpen, setNewRoleName, setIsTemplateDialogOpen, setIsRenameDialogOpen,

        setNewTemplateName, setTempTemplateName, setCreateEmptyMode, setStandardGroups, setCustomMemberNames,
        setNewGroupInput, setDeleteConfirm, setRoles,
        setWorshipRoles, // Added setter

        // Actions
        handleAddMember, handleAssignMemberToRole, handleSubmit, handleCreateRole, handleDeleteRole,
        handleSaveTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUpdateTemplateName,
        goToStep, nextStep: () => {
            if (step < totalSteps - 1) goToStep(step + 1);
        }, prevStep: () => {
            if (step > 0) goToStep(step - 1);
        }, getSuggestionsForTitle
    };
}
