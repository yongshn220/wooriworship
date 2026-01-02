import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { servingRolesAtom, fetchServingRolesSelector, servingSchedulesAtom, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { usersAtom } from "@/global-states/userState";
import { ServingService, WorshipService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { auth } from "@/firebase";
import { getPathServing } from "@/components/util/helper/routes";
import { FormMode } from "@/components/constants/enums";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";
import { ServingFormProps } from "../types";
import { ServingItem, ServingSchedule, ServingAssignment } from "@/models/serving";
import { getSuggestionsForTitle } from "../utils/serving-domain-logic";
import { getServiceTitleFromTags } from "@/components/util/helper/helper-functions";

export function useServingFormLogic({ teamId, mode = FormMode.CREATE, initialData }: ServingFormProps) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // global state
    const rolesLoadable = useRecoilValueLoadable(fetchServingRolesSelector(teamId));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);
    const setRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);

    const [roles, setRoles] = useState(rolesLoadable.state === 'hasValue' ? rolesLoadable.contents : []);

    useEffect(() => {
        if (rolesLoadable.state === 'hasValue') {
            setRoles(rolesLoadable.contents);
        }
    }, [rolesLoadable.state, rolesLoadable.contents]);

    // Form State
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const totalSteps = 4;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [serviceTagIds, setServiceTagIds] = useState<string[]>([]);
    const [items, setItems] = useState<ServingItem[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplatesLoaded, setIsTemplatesLoaded] = useState(false);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [hasTemplateChanges, setHasTemplateChanges] = useState(false);

    // Worship Plan Linking
    const [availableWorships, setAvailableWorships] = useState<any[]>([]);
    const [linkedWorshipId, setLinkedWorshipId] = useState<string | null>(null);
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

    // For Member Selection Drawer
    const [activeSelection, setActiveSelection] = useState<{ itemId?: string; assignmentIndex?: number; roleId: string } | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Modals & Drawers
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [tempTemplateName, setTempTemplateName] = useState("");
    const [createEmptyMode, setCreateEmptyMode] = useState(false);

    // Timeline Groups
    const [standardGroups, setStandardGroups] = useState<string[]>([]);
    const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);
    const [newGroupInput, setNewGroupInput] = useState("");

    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'role' | 'template'; id: string; open: boolean }>({ type: 'role', id: '', open: false });

    // History & Suggestions
    const [historySchedules, setHistorySchedules] = useState<ServingSchedule[]>([]);

    useEffect(() => {
        if (!teamId) {
            setHistorySchedules([]);
            return;
        }
        const fetchHistory = async () => {
            if (serviceTagIds.length > 0) {
                const recent = await ServingService.getRecentSchedulesByTag(teamId, serviceTagIds[0], 10);
                setHistorySchedules(recent);
            } else {
                const recent = await ServingService.getRecentSchedules(teamId, 10);
                setHistorySchedules(recent);
            }
        };
        fetchHistory();
    }, [teamId, serviceTagIds]);

    const suggestions = (title: string) => getSuggestionsForTitle(title, historySchedules, teamMembers);

    // Initialize roles & data
    useEffect(() => {
        if (teamId) {
            const loadInitialData = async () => {
                const [data, config] = await Promise.all([
                    ServingService.getTemplates(teamId),
                    ServingService.getServingConfig(teamId)
                ]);
                setTemplates(data);
                setIsTemplatesLoaded(true);

                if (config.customGroups.length > 0) {
                    setStandardGroups(prev => Array.from(new Set([...prev, ...config.customGroups])));
                }
                if (config.customNames.length > 0) {
                    setCustomMemberNames(config.customNames);
                }

                const latestSchedules = await ServingService.getRecentSchedules(teamId, 5);
                const lastUsedTemplateId = latestSchedules.find(s => s.templateId)?.templateId;
                if (lastUsedTemplateId) {
                    setSelectedTemplateId(lastUsedTemplateId);
                }
            };
            loadInitialData().catch(console.error);
        }
    }, [teamId]);

    const isInitialDataLoaded = useRef(false);

    // Initialize Data (EDIT Mode)
    useEffect(() => {
        if (mode === FormMode.EDIT && initialData && !isInitialDataLoaded.current) {
            const [y, m, d] = initialData.date.split('-').map(Number);
            const parsedDate = new Date(y, m - 1, d);
            setSelectedDate(parsedDate);
            setCurrentMonth(parsedDate);
            setServiceTagIds(initialData.service_tags || []);

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items);
                isInitialDataLoaded.current = true;
            } else if (initialData.roles && roles.length > 0) {
                // Migration logic preserved
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

    // Auto-load Template (CREATE Mode)
    useEffect(() => {
        if (mode === FormMode.CREATE && items.length === 0 && templates.length > 0) {
            const templateToLoad = templates.find(t => t.id === selectedTemplateId) || templates[0];
            if (templateToLoad) {
                setItems(templateToLoad.items.map((item: any, idx: number) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    order: idx,
                    title: item.title,
                    remarks: item.remarks,
                    assignments: [] as ServingAssignment[],
                    type: item.type,
                })));
                setSelectedTemplateId(templateToLoad.id);
            }
        }
    }, [mode, items.length, templates, selectedTemplateId]);

    // Track template changes
    useEffect(() => {
        if (!selectedTemplateId) {
            setHasTemplateChanges(true);
            return;
        }

        const currentTemplate = templates.find(t => t.id === selectedTemplateId);
        if (!currentTemplate) return;

        const currentItemsSimplifed = items.map(i => ({
            title: i.title,
            type: i.type,
            remarks: i.remarks || ""
        }));

        const templateItemsSimplified = currentTemplate.items.map((i: any) => ({
            title: i.title,
            type: i.type,
            remarks: i.remarks || ""
        }));

        const isSame = JSON.stringify(currentItemsSimplifed) === JSON.stringify(templateItemsSimplified);
        setHasTemplateChanges(!isSame);
    }, [items, selectedTemplateId, templates]);

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
    }, [selectedDate, teamId, mode, initialData, serviceTagIds, linkedWorshipId]);

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

    // Actions
    const handleAddMember = (itemId: string, assignmentIndex: number, uid: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                const newAssignments = [...item.assignments];
                while (newAssignments.length <= assignmentIndex) {
                    newAssignments.push({ memberIds: [] });
                }

                const updatedAssignments = newAssignments.map((asg, idx) => {
                    if (idx === assignmentIndex) {
                        const memberIds = asg.memberIds.includes(uid)
                            ? asg.memberIds.filter(id => id !== uid)
                            : [...asg.memberIds, uid];
                        return { ...asg, memberIds };
                    }
                    return asg;
                });
                return { ...item, assignments: updatedAssignments };
            }
            return item;
        }));
    };

    const handleAddMemberByRole = (roleId: string, uid: string) => {
        let newItems = [...items];
        let ptItemIdx = newItems.findIndex(i => i.type === 'WORSHIP_TEAM');
        if (ptItemIdx === -1) {
            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                order: items.length,
                title: '찬양팀 구성',
                assignments: [],
                type: 'WORSHIP_TEAM'
            });
            ptItemIdx = newItems.length - 1;
        }

        const newAssignments = [...newItems[ptItemIdx].assignments];
        let aIdx = newAssignments.findIndex(a => a.roleId === roleId);
        if (aIdx === -1) {
            newAssignments.push({ roleId: roleId, memberIds: [uid] });
        } else {
            const currentIds = newAssignments[aIdx].memberIds;
            if (currentIds.includes(uid)) {
                newAssignments[aIdx] = { ...newAssignments[aIdx], memberIds: currentIds.filter(id => id !== uid) };
            } else {
                newAssignments[aIdx] = { ...newAssignments[aIdx], memberIds: [...currentIds, uid] };
            }
        }

        setItems(newItems.map((it, idx) => idx === ptItemIdx ? { ...it, assignments: newAssignments } : it));
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
                worship_id: linkedWorshipId || null
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
                    date: dateString,
                    service_tags: serviceTagIds,
                    title: title,
                    items: items,
                    templateId: selectedTemplateId || null,
                    worship_id: linkedWorshipId || null,
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
                        return [...prev, newSchedule].sort((a, b) => a.date.localeCompare(b.date));
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

    const handleCreateRole = async () => {
        if (!newRoleName.trim() || !teamId) return;
        try {
            await ServingService.createRole(teamId, { teamId, name: newRoleName.trim(), order: roles.length });
            setRolesUpdater(prev => prev + 1);
            setNewRoleName("");
            setIsRoleDialogOpen(false);
            toast({ title: "Role created successfully!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to create role", variant: "destructive" });
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            await ServingService.deleteRole(teamId, roleId);
            setRolesUpdater(prev => prev + 1);
            setItems(prevItems => prevItems.map(item => ({
                ...item,
                assignments: item.assignments.filter(a => a.roleId !== roleId)
            })));
            toast({ title: "Role deleted" });
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to delete role", variant: "destructive" });
        }
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) return;
        try {
            const defaultFixedItem = {
                title: '찬양',
                type: 'WORSHIP_TEAM',
                remarks: "",
                assignments: [] as ServingAssignment[]
            };

            const itemsToSave = createEmptyMode ? [defaultFixedItem] : items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }));
            const templateData = {
                name: newTemplateName.trim(),
                teamId,
                items: itemsToSave
            };
            await ServingService.createTemplate(teamId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);

            const createdTemplate = newTemps.find(t => t.name === newTemplateName.trim());
            if (createdTemplate) {
                setSelectedTemplateId(createdTemplate.id);
                if (createEmptyMode) {
                    setItems([{
                        ...defaultFixedItem,
                        id: Math.random().toString(36).substr(2, 9),
                        order: 0,
                        assignments: []
                    } as ServingItem]);
                }
            }

            setNewTemplateName("");
            setCreateEmptyMode(false);
            setIsTemplateDialogOpen(false);
            toast({
                title: createEmptyMode ? "New template created!" : "Template saved!",
                description: `'${newTemplateName}' is now available.`
            });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save template", variant: "destructive" });
        }
    };

    const handleUpdateTemplate = async () => {
        if (!selectedTemplateId) return;
        try {
            const currentTemp = templates.find(t => t.id === selectedTemplateId);
            const templateData = {
                name: currentTemp?.name,
                items: items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }))
            };
            await ServingService.updateTemplate(teamId, selectedTemplateId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            toast({ title: "Template updated!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to update template", variant: "destructive" });
        }
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplateId) return;
        try {
            await ServingService.deleteTemplate(teamId, selectedTemplateId);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            setSelectedTemplateId(null);
            setItems([]);
            toast({ title: "Template deleted" });
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to delete template", variant: "destructive" });
        }
    };

    const handleUpdateTemplateName = async (newName: string) => {
        if (!selectedTemplateId) return;
        setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, name: newName } : t));
        if (newName.trim()) {
            try {
                await ServingService.updateTemplate(teamId, selectedTemplateId, { name: newName.trim() });
            } catch (e) {
                console.error(e);
            }
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
        isRoleDialogOpen, newRoleName, isTemplateDialogOpen, isRenameDialogOpen,
        newTemplateName, tempTemplateName, createEmptyMode,
        standardGroups, customMemberNames, newGroupInput, deleteConfirm,
        roles, team, teamMembers, historySchedules,
        isDuplicate, duplicateId, duplicateErrorMessage,

        // Setters
        setStep, setDirection, setSelectedDate, setCurrentMonth, setServiceTagIds, setItems,
        setTemplates, setIsTemplatesLoaded, setSelectedTemplateId, setHasTemplateChanges,
        setAvailableWorships, setLinkedWorshipId, setPreviewWorshipId, setActiveSelection, setIsLoading,
        setIsRoleDialogOpen, setNewRoleName, setIsTemplateDialogOpen, setIsRenameDialogOpen,
        setNewTemplateName, setTempTemplateName, setCreateEmptyMode, setStandardGroups, setCustomMemberNames,
        setNewGroupInput, setDeleteConfirm, setRoles,

        // Actions
        handleAddMember, handleAddMemberByRole, handleSubmit, handleCreateRole, handleDeleteRole,
        handleSaveTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUpdateTemplateName,
        goToStep, nextStep: () => {
            if (step < totalSteps - 1) goToStep(step + 1);
        }, prevStep: () => {
            if (step > 0) goToStep(step - 1);
        }, getSuggestionsForTitle: suggestions
    };
}
