import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { teamAtom } from "@/global-states/teamState";
import { servingSchedulesAtom } from "@/global-states/serviceRolesState";
import { usersAtom } from "@/global-states/userState";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { SetlistApi } from "@/apis/SetlistApi";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";
import { ServiceFlowApi } from "@/apis/ServiceFlowApi";
import LinkingApi from "@/apis/LinkingApi";
import PushNotificationApi from "@/apis/PushNotificationApi";
import { auth } from "@/firebase";
import { getPathServing } from "@/components/util/helper/routes";
import { FormMode } from "@/components/constants/enums";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";
import { ServiceFormProps } from "../types";
import { ServiceFormState, ServiceFlowItem, ServiceAssignment } from "@/models/services/ServiceEvent";
import { getServiceTitleFromTags, parseLocalDate } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { ServiceEvent } from "@/models/services/ServiceEvent";

// Import Split Hooks
import { useServiceRoles } from "./use-service-roles";
import { useServiceTemplates } from "./use-service-templates";
import { useServiceTimeline } from "./use-service-timeline";
import { useServiceHistory } from "./use-service-history";
import { useServiceTodos } from "./use-service-todos";

export function useServiceFormLogic({ teamId, mode = FormMode.CREATE, initialData }: ServiceFormProps) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);

    // --- 1. Roles Logic ---
    const {
        roles,
        setRoles,
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
        handleDeleteRole: baseHandleDeleteRole,
        handleAssignMemberToRole
    } = useServiceRoles(teamId);

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
    } = useServiceTimeline(teamId);

    // --- 2.5. Service Todos Logic ---
    const {
        todos: serviceTodos,
        originalTodosRef,
        addTodo: addServiceTodo,
        removeTodo: removeServiceTodo,
        toggleTodo: toggleServiceTodo,
        updateTodo: updateServiceTodo,
    } = useServiceTodos(teamId, mode, initialData?.id);

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
    } = useServiceTemplates(teamId, items, setItems);


    // --- 4. Main Form State (Date/Steps) ---
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const totalSteps = 5;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [serviceTagIds, setServiceTagIds] = useState<string[]>([]);

    // --- 5. Worship Linking ---
    const [availableSetlists, setAvailableSetlists] = useState<any[]>([]);
    const [linkedSetlistId, setLinkedSetlistId] = useState<string | null>(null);
    const [previewSetlistId, setPreviewSetlistId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // --- 6. History & Suggestions ---
    const { historySchedules, getSuggestionsForTitle } = useServiceHistory(teamId, serviceTagIds, teamMembers);

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
                    assignments: [] as ServiceAssignment[],
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

            // Set Linked Setlist
            if (initialData.setlist_id) setLinkedSetlistId(initialData.setlist_id);

            // Set Template ID if exists
            if (initialData.templateId) setSelectedTemplateId(initialData.templateId);

            // Load Flow Items (Strict separation)
            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items.filter(i => (i as any).type !== 'PRAISE_TEAM'));
            }

            // Load Praise Team
            if (initialData.praise_team && initialData.praise_team.length > 0) {
                setPraiseTeam(initialData.praise_team);
            } else if (initialData.items) {
                const oldRolesItem = initialData.items.find(i => (i as any).type === 'PRAISE_TEAM');
                if (oldRolesItem?.assignments) {
                    setPraiseTeam(oldRolesItem.assignments);
                } else if (initialData.roles) {
                    const migratedRoles = initialData.roles.map(r => ({ roleId: r.roleId, memberIds: r.memberIds }));
                    setPraiseTeam(migratedRoles);
                }
            }

            isInitialDataLoaded.current = true;
        }
    }, [mode, initialData, roles, setItems, setPraiseTeam, setSelectedTemplateId]);


    // Fetch available setlists (legacy worships)
    useEffect(() => {
        if (selectedDate && teamId) {
            ServiceEventApi.getLegacyWorshipsByDate(teamId, selectedDate).then(setlists => {
                const filteredSetlists = setlists.filter(s =>
                    serviceTagIds.some(t => s.service_tags?.includes(t)) ||
                    (mode === FormMode.EDIT && s.id === initialData?.setlist_id)
                );

                setAvailableSetlists(filteredSetlists);

                const currentSelectionExists = filteredSetlists.some(s => s.id === linkedSetlistId);

                if (currentSelectionExists) {
                    // Keep
                } else if (filteredSetlists.length > 0) {
                    setLinkedSetlistId(filteredSetlists[0].id);
                } else {
                    setLinkedSetlistId(null);
                }
            });
        } else {
            setAvailableSetlists([]);
            setLinkedSetlistId(null);
        }
    }, [selectedDate, teamId, mode, initialData, serviceTagIds, linkedSetlistId]);

    // Duplicate Check using ServiceEventApi
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
            const services = await ServiceEventApi.getServiceEvents(tid, s, e);
            return services as unknown as { id: string, service_tags?: string[] }[];
        }
    });


    // Wrapped Actions
    const handleDeleteRole = (roleId: string) => {
        baseHandleDeleteRole(roleId, (deletedId) => {
            // Clean up from praiseTeam
            setPraiseTeam(prev => prev.filter(a => a.roleId !== deletedId));
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
                setlist_id: linkedSetlistId || undefined
            };

            let targetServiceId: string;

            if (mode === FormMode.CREATE) {
                // 1. Create Core Service
                targetServiceId = await ServiceEventApi.createService(teamId, serviceData);

                // 2. Parallel Updates for Sub-Collections
                await Promise.all([
                    SetlistApi.updateSetlist(teamId, targetServiceId, { songs: [] }), // Setlist empty init or from worship? 
                    // Actually, if created from template, items are in flow. 
                    // Setlist is separate. In Form V3, Setlist might be linked or managed separately.
                    // For now, init empty setlist unless linked.
                    PraiseTeamApi.updatePraiseTeam(teamId, targetServiceId, { assignments: praiseTeam }),
                    ServiceFlowApi.updateFlow(teamId, targetServiceId, { items: items })
                ]);

                // 3. Link Setlist IF selected during create
                if (linkedSetlistId) {
                    await LinkingApi.linkSetlistAndService(teamId, linkedSetlistId, targetServiceId);
                }

                // 4. Notify & Stats
                const allAssignedMembers = Array.from(new Set([
                    ...items.flatMap(item => item.assignments.flatMap(a => a.memberIds)),
                    ...praiseTeam.flatMap(r => r.memberIds)
                ]));
                await PushNotificationApi.notifyMembersServingAssignment(
                    teamId,
                    auth.currentUser?.uid || "",
                    selectedDate,
                    allAssignedMembers
                );

                // Keep Stats Logic
                if (serviceTagIds.length > 0) {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    await ServiceEventApi.updateTagStats(teamId, serviceTagIds, dateStr, "add");
                }

                // 5. Save Todos
                if (serviceTodos.length > 0) {
                    const { TodoApi } = await import("@/apis/TodoApi");
                    await TodoApi.createServiceTodos(teamId, targetServiceId, title, serviceTodos.map((t, idx) => ({
                        title: t.title,
                        assigneeIds: t.assigneeIds,
                        order: idx,
                        createdBy: auth.currentUser?.uid || "",
                    })));
                }

                toast({ title: "Service created!" });
            } else {
                if (!initialData) return;
                targetServiceId = initialData.id;

                // 1. Update Core
                await ServiceEventApi.updateService(teamId, targetServiceId, serviceData);

                // 2. Update Sub-collections
                await Promise.all([
                    // Full update: Setlist is not currently editable in this specific ServingForm (V3 plan separate)
                    // But for consistency let's keep sub-services.
                    PraiseTeamApi.updatePraiseTeam(teamId, targetServiceId, { assignments: praiseTeam }),
                    ServiceFlowApi.updateFlow(teamId, targetServiceId, { items: items })
                ]);

                // 3. Update Link
                if (linkedSetlistId !== initialData.setlist_id) {
                    if (initialData.setlist_id) {
                        await LinkingApi.unlinkSetlist(teamId, initialData.setlist_id);
                    }
                    if (linkedSetlistId) {
                        await LinkingApi.linkSetlistAndService(teamId, linkedSetlistId, targetServiceId);
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
                    if (oldTags.length) await ServiceEventApi.updateTagStats(teamId, oldTags, dateStr, "remove");
                    if (serviceTagIds.length) await ServiceEventApi.updateTagStats(teamId, serviceTagIds, dateStr, "add");
                }

                // Save Todos (EDIT mode) — diff-based to preserve completion data
                {
                    const { TodoApi } = await import("@/apis/TodoApi");
                    const originalTodos = originalTodosRef.current;

                    // 1. Find removed todos (in original but not in current)
                    const currentIds = new Set(serviceTodos.filter(t => !t.isNew).map(t => t.id));
                    const removedIds = originalTodos
                        .filter(t => !currentIds.has(t.id))
                        .map(t => t.id);

                    // 2. Find modified todos (same id, different title or order)
                    const modifiedTodos = serviceTodos
                        .filter(t => !t.isNew)
                        .filter(t => {
                            const orig = originalTodos.find(o => o.id === t.id);
                            return orig && (orig.title !== t.title || orig.order !== t.order);
                        });

                    // 3. Find new todos
                    const newTodos = serviceTodos.filter(t => t.isNew);

                    // 4. Execute in parallel
                    await Promise.all([
                        removedIds.length > 0
                            ? TodoApi.batchDeleteTodos(teamId, removedIds)
                            : Promise.resolve(),
                        modifiedTodos.length > 0
                            ? TodoApi.batchUpdateTodos(teamId, modifiedTodos.map((t, idx) => ({
                                id: t.id,
                                data: { title: t.title, order: serviceTodos.indexOf(t) }
                            })))
                            : Promise.resolve(),
                        newTodos.length > 0
                            ? TodoApi.createServiceTodos(teamId, targetServiceId, title, newTodos.map((t) => ({
                                title: t.title,
                                assigneeIds: t.assigneeIds,
                                order: serviceTodos.indexOf(t),
                                createdBy: auth.currentUser?.uid || "",
                            })))
                            : Promise.resolve(),
                    ]);
                }

                toast({ title: "Service updated!" });
            }

            // Refresh logic: We rely on Navigation / SWR or Recoil.
            // If we use atom, we need to adapt new service back to old schedule format for Recoil?
            // "ServiceEvent" (V3) -> "ServingSchedule" (V1/V2 Adapter)
            // Or just invalidate/refetch.
            // For now, let's skip atom update if it's too complex or adapt it manually.
            // The list page uses ServiceEventApi to fetch, so it should be fine on next fetch.
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
        availableSetlists, linkedSetlistId, previewSetlistId,
        activeSelection, isLoading,
        isRoleDialogOpen, newRoleName, isCreatingRole, isTemplateDialogOpen, isRenameDialogOpen,
        newTemplateName, tempTemplateName, createEmptyMode,
        standardGroups, customMemberNames, newGroupInput, deleteConfirm,
        roles, team, teamMembers, historySchedules,
        isDuplicate, duplicateId, duplicateErrorMessage,
        praiseTeam, // Added praiseTeam to return
        serviceTodos,

        // Setters
        setStep, setDirection, setSelectedDate, setCurrentMonth, setServiceTagIds, setItems,
        setTemplates, setIsTemplatesLoaded, setSelectedTemplateId, setHasTemplateChanges,
        setAvailableSetlists, setLinkedSetlistId, setPreviewSetlistId, setActiveSelection, setIsLoading,
        setIsRoleDialogOpen, setNewRoleName, setIsTemplateDialogOpen, setIsRenameDialogOpen,

        setNewTemplateName, setTempTemplateName, setCreateEmptyMode, setStandardGroups, setCustomMemberNames,
        setNewGroupInput, setDeleteConfirm, setRoles,
        setPraiseTeam, // Added setter

        // Actions
        handleAddMember, handleAssignMemberToRole, handleSubmit, handleCreateRole, handleDeleteRole,
        handleSaveTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUpdateTemplateName,
        goToStep, nextStep: () => {
            if (step < totalSteps - 1) goToStep(step + 1);
        }, prevStep: () => {
            if (step > 0) goToStep(step - 1);
        }, getSuggestionsForTitle,
        addServiceTodo, removeServiceTodo, toggleServiceTodo, updateServiceTodo,
    };
}
