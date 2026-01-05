import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { teamAtom } from "@/global-states/teamState";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { usersAtom } from "@/global-states/userState";
import { ServingService, WorshipService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { auth } from "@/firebase";
import { getPathServing } from "@/components/util/helper/routes";
import { FormMode } from "@/components/constants/enums";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";
import { ServingFormProps } from "../types";
import { ServingSchedule, ServingItem, ServingAssignment } from "@/models/serving";
import { getServiceTitleFromTags, parseLocalDate } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";

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
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        newRoleName,
        setNewRoleName,
        isCreatingRole,
        deleteConfirm,
        setDeleteConfirm,
        handleCreateRole,
        handleDeleteRole: baseHandleDeleteRole
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
        handleAddMember,
        handleAddMemberByRole
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
            // Actually useServingTemplates loads templates.
            // We need to pick one.
            // Let's migrate the "Last Used" logic here or keep it.
            // The original code did: 
            // 1. fetch templates & config
            // 2. fetch recent schedules -> find last used template -> setSelectedTemplateId

            // Since getting templates is async in hook, strictly we should wait.
            // But let's check if we can do it here.

            // Simplification: Just pick first if nothing selected.
            // Or rely on the fact that useEffect below handles it if selectedTemplateId is set.
        }
    }, [mode, items.length, templates, selectedTemplateId]);

    // Initialize Last Used Template (One-time)
    useEffect(() => {
        if (teamId && mode === FormMode.CREATE && !selectedTemplateId) {
            ServingService.getRecentSchedules(teamId, 5).then(latest => {
                const lastUsed = latest.find(s => s.templateId)?.templateId;
                if (lastUsed) setSelectedTemplateId(lastUsed);
                else if (templates.length > 0) setSelectedTemplateId(templates[0].id);
            });
        }
    }, [teamId, mode, templates.length]); // Dependency on templates.length ensures we have loaded them

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
    }, [mode, selectedTemplateId, templates]); // Reduced dependencies


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

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items);
                isInitialDataLoaded.current = true;
            } else if (initialData.roles && roles.length > 0) {
                // Migration
                const migratedItems: ServingItem[] = initialData.roles.map((r, idx) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    order: idx,
                    title: roles.find(role => role.id === r.roleId)?.name || 'Role',
                    assignments: [{
                        roleId: r.roleId,
                        memberIds: r.memberIds
                    }],
                    type: 'FLOW'
                }));
                setItems(migratedItems);
                isInitialDataLoaded.current = true;
            }
        }
    }, [mode, initialData, roles]);


    // Fetch available worship plans
    useEffect(() => {
        if (selectedDate && teamId) {
            WorshipService.getWorshipsByDate(teamId, selectedDate).then(worships => {
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
    }, [selectedDate, teamId, mode, initialData, serviceTagIds, linkedWorshipId]); // removed strict deps slightly

    // Duplicate Check
    const serviceTagNames = serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id);
    const { isDuplicate, duplicateId, errorMessage: duplicateErrorMessage } = useServiceDuplicateCheck({
        teamId,
        date: selectedDate,
        serviceTagIds,
        serviceTagNames,
        mode,
        currentId: initialData?.id,
        fetcher: ServingService.getSchedules
    });


    // Wrapped Actions
    const handleDeleteRole = (roleId: string) => {
        baseHandleDeleteRole(roleId, (deletedId) => {
            setItems(prevItems => prevItems.map(item => ({
                ...item,
                assignments: item.assignments.filter(a => a.roleId !== deletedId)
            })));
        });
    };

    const handleSubmit = async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        try {
            const dateString = format(selectedDate, "yyyy-MM-dd");
            const title = getServiceTitleFromTags(serviceTagIds, team?.service_tags);

            const payload: Omit<ServingSchedule, "id"> = {
                teamId,
                date: dateString,
                service_tags: serviceTagIds,
                title: title,
                items: items,
                worship_id: linkedWorshipId || null,
                templateId: selectedTemplateId || undefined
            };

            if (mode === FormMode.CREATE) {
                await ServingService.createSchedule(teamId, payload);
                const allAssignedMembers = Array.from(new Set(
                    items.flatMap(item => item.assignments.flatMap(a => a.memberIds))
                ));
                await PushNotificationService.notifyMembersServingAssignment(
                    teamId,
                    auth.currentUser?.uid || "",
                    selectedDate,
                    allAssignedMembers
                );
                toast({ title: "Schedule created!" });
            } else {
                if (!initialData) return;
                const updatePayload = {
                    ...initialData,
                    ...payload,
                    // templateId: selectedTemplateId || null, // handled in payload
                };
                await ServingService.updateSchedule(teamId, updatePayload);
                toast({ title: "Schedule updated!" });
            }

            const newSchedule = await ServingService.getScheduleByDate(teamId, dateString);
            if (newSchedule) {
                setSchedules(prev => {
                    if (mode === FormMode.EDIT) {
                        return prev.map(s => s.id === newSchedule.id ? newSchedule : s);
                    } else {
                        return [...prev, newSchedule].sort((a, b) => {
                            const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                            const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                            return dateA - dateB;
                        });
                    }
                });
            }
            router.push(getPathServing(teamId));
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save schedule", variant: "destructive" });
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
        isRoleDialogOpen, newRoleName, setNewRoleName, isCreatingRole, setIsTemplateDialogOpen, setIsRenameDialogOpen,
        newTemplateName, tempTemplateName, createEmptyMode,
        standardGroups, customMemberNames, newGroupInput, deleteConfirm,
        roles, team, teamMembers, historySchedules,
        isDuplicate, duplicateId, duplicateErrorMessage,

        // Setters
        setStep, setDirection, setSelectedDate, setCurrentMonth, setServiceTagIds, setItems,
        setTemplates, setIsTemplatesLoaded, setSelectedTemplateId, setHasTemplateChanges,
        setAvailableWorships, setLinkedWorshipId, setPreviewWorshipId, setActiveSelection, setIsLoading,
        setIsRoleDialogOpen, setNewRoleName, setIsTemplateDialogOpen, setIsRenameDialogOpen,
        isRoleDialogOpen, newRoleName, isCreatingRole, isTemplateDialogOpen, isRenameDialogOpen,
        setNewTemplateName, setTempTemplateName, setCreateEmptyMode, setStandardGroups, setCustomMemberNames,
        setNewGroupInput, setDeleteConfirm, setRoles,

        // Actions
        handleAddMember, handleAddMemberByRole, handleSubmit, handleCreateRole, handleDeleteRole,
        handleSaveTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUpdateTemplateName,
        goToStep, nextStep: () => {
            if (step < totalSteps - 1) goToStep(step + 1);
        }, prevStep: () => {
            if (step > 0) goToStep(step - 1);
        }, getSuggestionsForTitle
    };
}
