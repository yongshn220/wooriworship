"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { servingRolesAtom, fetchServingRolesSelector, servingSchedulesAtom, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { auth } from "@/firebase";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, nextSunday } from "date-fns";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Check, FileText, MoreHorizontal, Info, Plus, Trash2, GripVertical, Save, ChevronUp, ChevronDown, UserPlus, User, Users, Pencil, X, Calendar as CalendarIcon } from "lucide-react";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { MemberSelector } from "./member-selector";
import { usersAtom } from "@/global-states/userState";
import { teamAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { getPathServing } from "@/components/util/helper/routes";
import { FormMode } from "@/components/constants/enums";
import { ServingSchedule, ServingItem, ServingAssignment } from "@/models/serving";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { AddActionButton, ServingCard, MemberSuggestionList, MemberBadge, WorshipTeamRoleRow } from "./serving-components";
import { ServingMemberList } from "@/components/elements/design/serving/serving-member-list";


interface Props {
    teamId: string;
    mode?: FormMode;
    initialData?: ServingSchedule;
}


export function ServingForm({ teamId, mode = FormMode.CREATE, initialData }: Props) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));
    const containerRef = useRef<HTMLDivElement>(null);

    // Recoil
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
    const [step, setStep] = useState(0); // 0: When, 1: Who, 2: What, 3: Review
    const [direction, setDirection] = useState(0);
    const totalSteps = 4;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(nextSunday(new Date()));
    const [items, setItems] = useState<ServingItem[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplatesLoaded, setIsTemplatesLoaded] = useState(false);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [hasTemplateChanges, setHasTemplateChanges] = useState(false);

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

                // Initialize groups and custom members
                if (config.customGroups.length > 0) {
                    setStandardGroups(prev => Array.from(new Set([...prev, ...config.customGroups])));
                }
                if (config.customNames.length > 0) {
                    setCustomMemberNames(config.customNames);
                }

                // 2. Track last used template from recent schedule
                const latestSchedules = await ServingService.getRecentSchedules(teamId, 5);
                const lastUsedTemplateId = latestSchedules.find(s => s.templateId)?.templateId;
                if (lastUsedTemplateId) {
                    setSelectedTemplateId(lastUsedTemplateId);
                }
            };

            loadInitialData().catch(console.error);
        }
    }, [teamId]); // Only run when teamId changes

    // Initialize Data (EDIT Mode)
    useEffect(() => {
        if (mode === FormMode.EDIT && initialData) {
            const [y, m, d] = initialData.date.split('-').map(Number);
            const parsedDate = new Date(y, m - 1, d);
            setSelectedDate(parsedDate);

            if (initialData.items) {
                setItems(initialData.items);
            } else if (initialData.roles) {
                // Migration: Convert old roles to items
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
            }
        }
    }, [mode, initialData, roles]); // Removed items.length dependency

    // Auto-load Template (CREATE Mode)
    useEffect(() => {
        if (mode === FormMode.CREATE && items.length === 0 && templates.length > 0) {
            // Priority 1: Use selectedTemplateId (last used) or first template
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

    // Helpers
    const getMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || id; // Fallback to ID (name) for manual entries

    const handleAddMember = (itemId: string, assignmentIndex: number, uid: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                // Ensure assignments exist up to assignmentIndex
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

            const payload: Omit<ServingSchedule, "id"> = {
                teamId,
                date: dateString,
                items: items,
            };

            if (mode === FormMode.CREATE) {
                await ServingService.createSchedule(teamId, payload);

                // Notify assigned members
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
                    items: items,
                    templateId: selectedTemplateId || null,
                };
                await ServingService.updateSchedule(teamId, updatePayload);
                toast({ title: "Schedule updated!" });
            }

            // Refetch
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

    // Actions
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
            const itemsToSave = createEmptyMode ? [] : items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }));
            const templateData = {
                name: newTemplateName.trim(),
                teamId,
                items: itemsToSave
            };
            await ServingService.createTemplate(teamId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);

            // Select the new template
            const createdTemplate = newTemps.find(t => t.name === newTemplateName.trim());
            if (createdTemplate) {
                setSelectedTemplateId(createdTemplate.id);
                // If we created an empty template, clear the items on screen
                if (createEmptyMode) {
                    setItems([]);
                }
                // If we saved current items as new template, we don't need to change items, but we are now "on" that template.
            }

            setNewTemplateName("");
            setCreateEmptyMode(false);
            setIsTemplateDialogOpen(false);
            toast({
                title: createEmptyMode ? "Empty template created!" : "Template saved!",
                description: `'${newTemplateName}' is now available for reuse.`
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
                name: currentTemp?.name, // Preserve name if not explicitly changed elsewhere
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
        // Update local state immediately to allow typing/deleting everything
        setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, name: newName } : t));

        // Update DB only if not empty (to avoid empty names in DB if desired) or just update anyway
        if (newName.trim()) {
            try {
                await ServingService.updateTemplate(teamId, selectedTemplateId, { name: newName.trim() });
            } catch (e) {
                console.error(e);
            }
        }
    };

    // Navigation
    const goToStep = (targetStep: number) => {
        if (targetStep > 0 && !selectedDate) {
            toast({ title: "Please select a date first" });
            return;
        }
        setDirection(targetStep > step ? 1 : -1);
        setStep(targetStep);
    };

    const nextStep = () => {
        if (step < totalSteps - 1) goToStep(step + 1);
    };

    const prevStep = () => {
        if (step > 0) goToStep(step - 1);
    };

    // Scroll to top on step change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [step]);

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            position: 'absolute' as const
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            position: 'relative' as const
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
            position: 'absolute' as const
        })
    };

    // Prevent flash: Show skeleton if fetching or if data is not ready
    if (rolesLoadable.state !== 'hasValue') {
        return <ServingFormSkeleton />;
    }

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-gray-50 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">

            {/* STICKY HEADER - Minimal with Gradient Mask */}
            <div className="sticky top-0 z-50 w-full px-6 pt-8 pb-12 flex items-center justify-between pointer-events-none bg-gradient-to-b from-gray-50 via-gray-50/90 to-transparent">
                {/* Exit Button - Left aligned */}
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background/50 hover:bg-background shadow-sm pointer-events-auto backdrop-blur-sm" onClick={() => router.back()}>
                    <X className="w-5 h-5 text-muted-foreground" />
                </Button>

                {/* Step Bar - Centered */}
                <div className="flex gap-1 p-1 bg-white/50 backdrop-blur-md rounded-full shadow-sm pointer-events-auto absolute left-1/2 -translate-x-1/2">
                    {["When", "Who", "What", "Review"].map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToStep(idx)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                                step === idx
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-4 pb-32 relative">
                <AnimatePresence initial={false} custom={direction}>
                    {/* Step 1: When */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                            className="flex flex-col gap-8 w-full"
                        >
                            <div className="space-y-2 text-center">
                                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 1</Label>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Select Date</h2>
                            </div>

                            <div className="bg-card rounded-3xl shadow-xl shadow-foreground/5 border border-border/50 p-2 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date);
                                            nextStep();
                                        }
                                    }}
                                    className="rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Who (Assign Roles) */}
                    {step === 1 && (
                        <motion.div
                            key="who-step"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                            className="flex flex-col gap-8 w-full"
                        >
                            <div className="space-y-2 text-center">
                                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 2</Label>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Select Worship Team</h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Reorder.Group axis="y" values={roles} onReorder={(newRoles) => {
                                    setRoles(newRoles);
                                    ServingService.updateRolesOrder(teamId, newRoles).catch(console.error);
                                }} className="flex flex-col gap-4">
                                    {roles.map((role) => {
                                        const ptItem = items.find(item => item.type === 'WORSHIP_TEAM');
                                        const assignment = ptItem?.assignments.find(a => a.roleId === role.id);
                                        const memberIds = assignment?.memberIds || [];

                                        return (
                                            <SortableRoleItem
                                                key={role.id}
                                                role={role}
                                                memberIds={memberIds}
                                                teamMembers={teamMembers}
                                                onAddMember={handleAddMemberByRole}
                                                onDeleteRole={() => setDeleteConfirm({ type: 'role', id: role.id, open: true })}
                                                onOpenAdd={() => setActiveSelection({ roleId: role.id })}
                                            />
                                        );
                                    })}
                                </Reorder.Group>

                                <AddActionButton
                                    label="Add Role"
                                    onClick={() => setIsRoleDialogOpen(true)}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: What (Worship Timeline) */}
                    {step === 2 && (
                        <motion.div
                            key="what-step"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                            className="flex flex-col gap-8 w-full"
                        >
                            <div className="space-y-2 text-center">
                                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 3</Label>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Set up Cuelist</h2>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Template Header & Actions */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-5 px-5">
                                        {templates.map(tmp => (
                                            <button
                                                key={tmp.id}
                                                onClick={() => {
                                                    setSelectedTemplateId(tmp.id);
                                                    setItems(tmp.items.map((it: any, idx: number) => ({
                                                        ...it,
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        order: idx,
                                                        assignments: it.type === 'WORSHIP_TEAM'
                                                            ? (items.find(i => i.type === 'WORSHIP_TEAM')?.assignments || [])
                                                            : []
                                                    })));
                                                }}
                                                className={cn(
                                                    "flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95",
                                                    selectedTemplateId === tmp.id
                                                        ? "bg-primary/5 text-primary border border-primary shadow-sm"
                                                        : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                {tmp.name}
                                            </button>
                                        ))}
                                        <button
                                            className="flex-shrink-0 px-4 py-2 bg-transparent text-gray-400 border border-dashed border-gray-200 rounded-full text-[13px] font-medium active:scale-95 transition-all hover:bg-gray-50 hover:border-gray-300 flex items-center gap-1"
                                            onClick={() => {
                                                setNewTemplateName("");
                                                setCreateEmptyMode(true);
                                                setIsTemplateDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
                                        </button>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-900 hover:text-black hover:bg-gray-50 transition-colors flex-shrink-0">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-3xl p-2 shadow-2xl border-0">
                                            <DropdownMenuItem
                                                className="rounded-2xl py-3 cursor-pointer font-bold"
                                                disabled={!selectedTemplateId}
                                                onClick={() => {
                                                    setTempTemplateName(templates.find(t => t.id === selectedTemplateId)?.name || "");
                                                    setIsRenameDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Rename Template
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                            <DropdownMenuItem
                                                className={cn("rounded-2xl py-3 cursor-pointer", hasTemplateChanges ? "text-primary font-bold bg-primary/5" : "text-muted-foreground")}
                                                disabled={!selectedTemplateId || !hasTemplateChanges}
                                                onClick={handleUpdateTemplate}
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Save to "{templates.find(t => t.id === selectedTemplateId)?.name}"
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-2xl py-3 cursor-pointer font-bold"
                                                onClick={() => {
                                                    const currentTemp = templates.find(t => t.id === selectedTemplateId);
                                                    setNewTemplateName(`${currentTemp?.name || "Template"} copy`);
                                                    setCreateEmptyMode(false);
                                                    setIsTemplateDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Save as New
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                            <DropdownMenuItem
                                                className="rounded-2xl py-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                                                onClick={() => setDeleteConfirm({ type: 'template', id: selectedTemplateId || '', open: true })}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Template
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-4">
                                    {!isTemplatesLoaded ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="animate-pulse p-6 rounded-3xl bg-card space-y-3 border border-border/50">
                                                <div className="h-5 bg-muted rounded w-1/3" />
                                                <div className="h-4 bg-muted rounded w-1/2" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {templates.length === 0 && (
                                                <div className="px-6 py-5 mb-2 bg-primary/5 rounded-3xl border border-primary/10 border-dashed text-center">
                                                    <p className="text-sm font-bold text-primary mb-1">✨ Sample Flow Ready</p>
                                                    <p className="text-xs text-muted-foreground leading-tight px-4">
                                                        No templates found in DB. We&apos;ve prepared a sample flow to get you started!
                                                    </p>
                                                </div>
                                            )}
                                            <Reorder.Group axis="y" values={items} onReorder={(newOrdered) => {
                                                setItems(newOrdered);
                                            }} className="flex flex-col gap-4">
                                                {items.map((item, index) => {
                                                    if (item.type === 'WORSHIP_TEAM') {
                                                        return (
                                                            <SortableWorshipItem
                                                                key={item.id}
                                                                item={item}
                                                                getMemberName={getMemberName}
                                                                onGoToStep2={() => goToStep(1)}
                                                                onUpdate={(newItem) => {
                                                                    const newItems = items.map(i => i.id === item.id ? newItem : i);
                                                                    setItems(newItems);
                                                                }}
                                                                roles={roles}
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <SortableTimelineItem
                                                            key={item.id}
                                                            item={item}
                                                            getMemberName={getMemberName}
                                                            onUpdate={(newItem) => {
                                                                const newItems = items.map(i => i.id === item.id ? newItem : i);
                                                                setItems(newItems);
                                                            }}
                                                            onDelete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                                                            onOpenAdd={(aIdx) => setActiveSelection({
                                                                itemId: item.id,
                                                                assignmentIndex: aIdx,
                                                                roleId: "timeline-default"
                                                            })}
                                                            onRemoveMember={(aIdx, uid) => {
                                                                handleAddMember(item.id, aIdx, uid);
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </Reorder.Group>

                                            <AddActionButton
                                                label="Add Sequence"
                                                onClick={() => setItems([...items, {
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    order: items.length,
                                                    title: "",
                                                    assignments: [{ memberIds: [] }],
                                                    type: 'FLOW'
                                                }])}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Review */}
                    {step === 3 && (
                        <motion.div
                            key="review-step"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex flex-col w-full pb-20"
                        >
                            {/* Minimal Header for Step 4 */}
                            {selectedDate && (
                                <div className="flex flex-col items-center justify-center py-4 border-b border-border/10 mb-0 mx-auto mb-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 opacity-80">Final Review</span>
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                                            {format(selectedDate, "MMM d")}
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide opacity-70">
                                            {format(selectedDate, "EEEE, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* CUE SHEET / TIMELINE LIST */}
                            <div className="flex flex-col w-full">
                                <ServingMemberList
                                    schedule={{ items, id: "", date: "", teamId: "" } as any} // Mocking minimal schedule object
                                    roles={roles}
                                    members={teamMembers}
                                    currentUserUid={auth.currentUser?.uid}
                                />
                                {items.length === 0 && (
                                    <div className="py-12 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                                            <FileText className="w-5 h-5 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-muted-foreground text-sm">No items in the plan yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* STICKY FOOTER - Minimal with Gradient Mask */}
            <div className="sticky bottom-0 z-50 w-full px-6 pb-8 pt-12 pointer-events-none bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent">
                <AnimatePresence>
                    {step === 2 && hasTemplateChanges && selectedTemplateId && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-2xl mx-auto mb-4 pointer-events-auto flex justify-center"
                        >
                            <button
                                onClick={handleUpdateTemplate}
                                className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-xl group active:scale-95 transition-all"
                            >
                                <span className="text-[13px] font-bold text-primary">
                                    Save to "{templates.find(t => t.id === selectedTemplateId)?.name}"
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex gap-3 w-full max-w-2xl mx-auto pointer-events-auto">
                    <div className="w-12 h-12 flex-none">
                        <Button
                            variant="outline"
                            className="h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground shadow-sm disabled:opacity-0 disabled:pointer-events-none transition-opacity duration-300"
                            onClick={prevStep}
                            disabled={step === 0}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </div>
                    <Button
                        className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                        onClick={step === totalSteps - 1 ? handleSubmit : nextStep}
                        disabled={isLoading || (step === 0 && !selectedDate)}
                    >
                        {isLoading ? (
                            "Saving..."
                        ) : step === totalSteps - 1 ? (
                            <>Confirm <Check className="w-5 h-5 ml-1" /></>
                        ) : (
                            <>Next <ArrowRight className="w-5 h-5 ml-1" /></>
                        )}
                    </Button>
                </div>
            </div>

            {/* Member Selection Drawer */}
            <Drawer open={!!activeSelection} onOpenChange={(open) => !open && setActiveSelection(null)}>
                <DrawerContent className="h-[85vh] rounded-t-[2.5rem]">
                    <div className="mx-auto w-full max-w-lg h-full flex flex-col pt-2 relative">
                        {/* Header */}
                        <div className="flex flex-col gap-1 px-8 pt-6 pb-2">
                            <div className="flex items-center justify-between">
                                <DrawerTitle className="text-2xl font-bold text-foreground tracking-tight">
                                    Select Member
                                </DrawerTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-muted h-10 w-10"
                                    onClick={() => setActiveSelection(null)}
                                >
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>

                        {/* Unified Scroll Area */}
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col gap-8 pb-32 pt-6 px-8">

                                <MemberSelector
                                    selectedMemberIds={
                                        activeSelection?.itemId && activeSelection.assignmentIndex !== undefined
                                            ? items.find(i => i.id === activeSelection.itemId)?.assignments[activeSelection.assignmentIndex]?.memberIds || []
                                            : activeSelection?.roleId
                                                ? items.find(i => i.title === '찬양팀 구성')?.assignments.find(a => a.roleId === activeSelection.roleId)?.memberIds || []
                                                : []
                                    }
                                    onSelect={(memberId) => {
                                        if (activeSelection?.itemId && activeSelection.assignmentIndex !== undefined) {
                                            handleAddMember(activeSelection.itemId, activeSelection.assignmentIndex, memberId);
                                        } else if (activeSelection?.roleId) {
                                            handleAddMemberByRole(activeSelection.roleId, memberId);
                                        }
                                    }}
                                    multiple
                                    groups={standardGroups}
                                    onAddGroup={(name) => {
                                        setStandardGroups(prev => [...prev, name]);
                                        ServingService.addCustomGroup(teamId, name).catch(console.error);
                                    }}
                                    onRemoveGroup={(idx) => {
                                        setStandardGroups(standardGroups.filter((_, i) => i !== idx));
                                    }}
                                    customMemberNames={customMemberNames}
                                    onAddCustomMember={(name) => {
                                        setCustomMemberNames(prev => [...prev, name]);
                                        ServingService.addCustomMemberName(teamId, name).catch(console.error);
                                    }}
                                />
                            </div>
                        </ScrollArea>

                        {/* Sticky Bottom Action */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-10 pb-10 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
                            <Button
                                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-xl pointer-events-auto active:scale-95 transition-all"
                                onClick={() => setActiveSelection(null)}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </DrawerContent >
            </Drawer >

            {/* Role Creation Dialog */}
            < Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen} >
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-0 shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-center">New Role</DialogTitle>
                        <p className="text-sm text-center text-muted-foreground font-medium">
                            Create a new role for your praise team.
                        </p>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Input
                            placeholder="e.g. Acoustic Guitar"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.nativeEvent.isComposing) return;
                                if (e.key === "Enter" && newRoleName.trim()) {
                                    handleCreateRole();
                                }
                            }}
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 px-5 text-lg font-medium shadow-inner focus:bg-white transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="flex sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            className="h-12 flex-1 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsRoleDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-12 flex-1 rounded-2xl font-bold shadow-lg"
                            onClick={handleCreateRole}
                            disabled={!newRoleName.trim()}
                        >
                            Create Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Template Saving Dialog */}
            < Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen} >
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-0 shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                {createEmptyMode ? <Plus className="w-8 h-8 text-primary" /> : <Save className="w-8 h-8 text-primary" />}
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">
                            {createEmptyMode ? "Create New Template" : "Save Template"}
                        </DialogTitle>
                        <p className="text-sm text-center text-muted-foreground font-medium leading-relaxed">
                            {createEmptyMode
                                ? "Create a new empty template to start designing a fresh timeline."
                                : "Save this timeline as a template to reuse it for future worship services."}
                        </p>
                    </DialogHeader>
                    <div className="py-6">
                        <Input
                            placeholder="e.g. Sunday Morning Worship"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.nativeEvent.isComposing) return;
                                if (e.key === "Enter" && newTemplateName.trim()) {
                                    handleSaveTemplate();
                                }
                            }}
                            className="h-14 rounded-2xl border-gray-100 bg-secondary/30 px-5 text-lg font-medium shadow-inner focus:bg-white transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="flex sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            className="h-12 flex-1 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-secondary"
                            onClick={() => setIsTemplateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-12 flex-1 rounded-2xl font-bold shadow-lg"
                            onClick={handleSaveTemplate}
                            disabled={!newTemplateName.trim()}
                        >
                            {createEmptyMode ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Template Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="max-w-[calc(100%-40px)] w-[400px] rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 text-left">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Rename Template</DialogTitle>
                    </DialogHeader>
                    <div className="px-8 pb-8 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[13px] font-bold text-primary uppercase tracking-wider ml-1">NEW NAME</Label>
                            <Input
                                value={tempTemplateName}
                                onChange={(e) => setTempTemplateName(e.target.value)}
                                placeholder="Enter template name..."
                                className="h-14 px-5 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all"
                                onClick={() => setIsRenameDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 h-14 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all"
                                onClick={() => {
                                    handleUpdateTemplateName(tempTemplateName);
                                    setIsRenameDialogOpen(false);
                                }}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                isOpen={deleteConfirm.open}
                setOpen={(open: boolean) => setDeleteConfirm(prev => ({ ...prev, open }))}
                title={deleteConfirm.type === 'role' ? "Delete Role" : "Delete Template"}
                description={deleteConfirm.type === 'role'
                    ? "Are you sure you want to delete this role from the team? This action cannot be undone."
                    : "Are you sure you want to delete this template? This action cannot be undone."
                }
                onDeleteHandler={() => {
                    if (deleteConfirm.type === 'role') {
                        return handleDeleteRole(deleteConfirm.id);
                    } else {
                        return handleDeleteTemplate();
                    }
                }}
            />
        </div >
    );
}

function ServingFormSkeleton() {
    return (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col overflow-hidden">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 w-full px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex gap-1">
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                </div>
                <div className="w-10" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
                <div className="space-y-4 text-center flex flex-col items-center">
                    <Skeleton className="h-4 w-16 bg-gray-200" />
                    <Skeleton className="h-8 w-48 bg-gray-200" />
                </div>
                <Skeleton className="w-full h-[300px] rounded-3xl bg-gray-200" />
            </div>

            {/* Footer Skeleton */}
            <div className="sticky bottom-0 z-50 w-full px-6 pb-8 pt-4 pointer-events-none">
                <div className="flex gap-3 w-full max-w-2xl mx-auto pointer-events-auto">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-12 flex-1 rounded-full bg-gray-200" />
                </div>
            </div>
        </div>
    )
}

interface SortableRoleItemProps {
    role: any;
    memberIds: string[];
    teamMembers: any[];
    onAddMember: (roleId: string, uid: string) => void;
    onDeleteRole: () => void;
    onOpenAdd: () => void;
}

function SortableRoleItem({ role, memberIds, teamMembers, onAddMember, onDeleteRole, onOpenAdd }: SortableRoleItemProps) {
    const controls = useDragControls();
    const isAssigned = memberIds.length > 0;

    // Get suggested members who are NOT yet assigned
    const suggestions = (role.default_members && role.default_members.length > 0
        ? teamMembers.filter(m => role.default_members?.includes(m.id) && !memberIds.includes(m.id))
        : []);

    return (
        <Reorder.Item value={role} dragListener={false} dragControls={controls} className="select-none relative">
            <ServingCard className="p-0 gap-0 overflow-hidden border-none shadow-sm rounded-xl bg-white relative group transition-transform duration-200">
                {/* Drag Handle - Top Left */}
                <div
                    className="absolute left-3 top-5 p-2 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 hover:bg-gray-50 rounded-lg transition-colors touch-none"
                    onPointerDown={(e) => controls.start(e)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="text-gray-300 w-5 h-5" />
                </div>

                {/* Delete Button - Absolute Top Right */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-5 p-2 h-auto w-auto text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRole();
                    }}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>

                {/* Main Content - Top (Role Name) */}
                <div className="pl-12 pr-12 pt-6 pb-3">
                    <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{role.name}</h3>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100/60 mx-5" />

                {/* Bottom Row - Assignments & Suggestions */}
                <div
                    className="px-5 pt-2 pb-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100/70 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAdd();
                    }}
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex flex-wrap gap-2.5 pointer-events-auto">
                            {memberIds.map(uid => (
                                <MemberBadge
                                    key={uid}
                                    name={teamMembers.find(m => m.id === uid)?.name || uid}
                                    onRemove={() => onAddMember(role.id, uid)}
                                />
                            ))}

                            {/* Suggested Chips with Dashed Border */}
                            {suggestions.map(member => (
                                <button
                                    key={member.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddMember(role.id, member.id);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-dashed border-gray-300 rounded-full text-[13px] font-bold text-gray-500 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    {member.name.replace(/^group:/, "")}
                                </button>
                            ))}

                            {!isAssigned && suggestions.length === 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenAdd();
                                    }}
                                    className="flex items-center gap-3 text-gray-400 group-hover:text-blue-500 transition-colors py-1 pointer-events-auto"
                                >
                                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                                        <Plus className="text-gray-300 w-4 h-4 group-hover:text-blue-500" />
                                    </div>
                                    <span className="text-[13px] font-bold">Assign Member</span>
                                </button>
                            )}
                        </div>
                        {(isAssigned || suggestions.length > 0) && (
                            <div className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                                <Plus className="text-blue-500 w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>
            </ServingCard>
        </Reorder.Item>
    );
}


interface SortableWorshipItemProps {
    item: ServingItem;
    getMemberName: (id: string) => string;
    onGoToStep2: () => void;
    onUpdate: (newItem: ServingItem) => void;
    roles: any[]; // Using any to avoid strict type issues if ServingRole isn't imported, but assuming roles structure
}

function SortableWorshipItem({ item, getMemberName, onGoToStep2, onUpdate, roles }: SortableWorshipItemProps) {
    const controls = useDragControls();

    // Determine active roles (those with assigned members)
    const activeRoles = roles.filter(role => {
        const assignment = item.assignments.find(a => a.roleId === role.id);
        return assignment && assignment.memberIds.length > 0;
    });

    const MAX_DISPLAY = 6;
    const hasMore = activeRoles.length > MAX_DISPLAY;
    const displayRoles = hasMore ? activeRoles.slice(0, MAX_DISPLAY) : activeRoles;
    const remainingCount = activeRoles.length - MAX_DISPLAY;

    return (
        <Reorder.Item value={item} dragListener={false} dragControls={controls} className="relative z-0 select-none">
            <div className="group flex flex-col gap-4 p-5 rounded-3xl border bg-gradient-to-br from-blue-50/50 to-white shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500" onPointerDown={(e) => controls.start(e)}>
                        <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50 whitespace-nowrap">
                                Fixed Item
                            </Badge>
                            <div className="flex items-center gap-2 group/edit w-full">
                                <input
                                    value={item.title}
                                    onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-lg font-bold text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full leading-tight"
                                    placeholder="Title"
                                />
                                <Pencil className="w-4 h-4 text-gray-300 group-hover/edit:text-blue-500 transition-colors opacity-0 group-hover/edit:opacity-100" />
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onGoToStep2} className="text-xs text-primary hover:bg-primary/10 h-8 rounded-full whitespace-nowrap">
                        Edit
                    </Button>
                </div>

                {/* Content: Read-only list of assigned roles */}
                <div className="pl-8 space-y-2">
                    {activeRoles.length > 0 ? (
                        <div className="flex flex-col gap-3 w-full">
                            {displayRoles.map(role => {
                                const assignment = item.assignments.find(a => a.roleId === role.id);
                                if (!assignment) return null;

                                return (
                                    <WorshipTeamRoleRow
                                        key={role.id}
                                        roleName={role.name}
                                        memberIds={assignment.memberIds}
                                        getMemberName={getMemberName}
                                        className="border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                                    />
                                );
                            })}

                            {hasMore && (
                                <button
                                    onClick={onGoToStep2}
                                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:text-primary transition-colors mt-1"
                                >
                                    View {remainingCount} more roles...
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground italic">No members assigned.</p>
                            <Button variant="link" size="sm" onClick={onGoToStep2} className="h-auto p-0 text-primary">
                                Assign in Step 2
                            </Button>
                        </div>
                    )
                    }
                </div>
            </div>
        </Reorder.Item>
    );
}

interface SortableTimelineItemProps {
    item: any;
    getMemberName: (id: string) => string;
    onUpdate: (newItem: any) => void;
    onDelete: () => void;
    onOpenAdd: (assignmentIndex: number) => void;
    onRemoveMember: (assignmentIndex: number, uid: string) => void;
}

function SortableTimelineItem({ item, getMemberName, onUpdate, onDelete, onOpenAdd, onRemoveMember }: SortableTimelineItemProps) {
    const controls = useDragControls();

    const assignment = item.assignments[0] || { memberIds: [] };
    const memberCount = assignment.memberIds.length;
    const isAssigned = memberCount > 0;

    return (
        <Reorder.Item value={item} dragListener={false} dragControls={controls} className="select-none relative">
            <ServingCard className="p-0 gap-0 overflow-hidden border-none shadow-sm rounded-xl bg-white relative group transition-transform duration-200">
                {/* Drag Handle - Top Left */}
                <div
                    className="absolute left-3 top-5 p-2 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 hover:bg-gray-50 rounded-lg transition-colors touch-none"
                    onPointerDown={(e) => controls.start(e)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="text-gray-300 w-5 h-5" />
                </div>

                {/* Delete Button - Absolute Top Right */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-5 h-8 w-8 p-0 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-50 pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>

                {/* Main Content - Top (Title/Remarks) */}
                <div className="pl-12 pr-12 pt-6 pb-3">
                    <div className="flex flex-col gap-1.5">
                        {/* Title Input */}
                        <div className="flex items-center gap-2 group/edit w-full">
                            <input
                                value={item.title}
                                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[18px] font-bold text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full leading-tight"
                                placeholder="Sequence Title"
                            />
                            <Pencil className="w-4 h-4 text-gray-300 group-hover/edit:text-blue-500 transition-colors opacity-0 group-hover/edit:opacity-100" />
                        </div>
                        {/* Remarks Input */}
                        <div className="flex items-center gap-2 group/edit w-full">
                            <input
                                value={item.remarks || ""}
                                onChange={(e) => onUpdate({ ...item, remarks: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[14px] text-gray-400 font-medium bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full"
                                placeholder="Add note..."
                            />
                            <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover/edit:text-blue-500 transition-colors opacity-0 group-hover/edit:opacity-100" />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100/60 mx-5" />

                {/* Bottom Row - Assignments (Full Width Padding) */}
                <div
                    className="px-5 pt-2 pb-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:bg-gray-100/70 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAdd(0);
                    }}
                >
                    <div className="flex flex-wrap gap-2.5 pointer-events-auto">
                        {isAssigned ? (
                            assignment.memberIds.map((uid: string) => {
                                const name = getMemberName(uid);
                                const isGroup = name.startsWith('group:') || uid.startsWith('group:');
                                const displayName = name.replace(/^group:/, '');
                                return (
                                    <button
                                        key={uid}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveMember(0, uid);
                                        }}
                                        className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 bg-gray-50/50 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group/member"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                            {isGroup ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-600 group-hover/member:text-gray-900">
                                            {displayName}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAdd(0);
                                }}
                                className="flex items-center gap-3 text-gray-400 group-hover:text-blue-500 transition-colors py-1 pointer-events-auto"
                            >
                                <div className="w-6 h-6 rounded-full border border-dashed border-current flex items-center justify-center">
                                    <Plus className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[13px] font-bold">Assign Member</span>
                            </button>
                        )}
                    </div>
                    {isAssigned && (
                        <div className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                            <Plus className="text-blue-500 w-4 h-4" />
                        </div>
                    )}
                </div>
            </ServingCard>
        </Reorder.Item>
    );
}
