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
import { ArrowLeft, ArrowRight, ChevronLeft, Check, FileText, MoreHorizontal, Info, Plus, Trash2, GripVertical, Save, ChevronUp, ChevronDown, UserPlus, Pencil, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { AddActionButton, ServingCard, MemberSuggestionList, MemberBadge } from "./serving-components";


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

    const roles = rolesLoadable.state === 'hasValue' ? rolesLoadable.contents : [];


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
    const [activeSelection, setActiveSelection] = useState<{
        itemId: string;
        assignmentIndex: number;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Modals & Drawers
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'role' | 'template'; id: string; open: boolean }>({ type: 'role', id: '', open: false });

    // Initialize roles & data
    useEffect(() => {
        if (teamId) {
            const loadInitialData = async () => {
                const data = await ServingService.getTemplates(teamId);
                setTemplates(data);
                setIsTemplatesLoaded(true);

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
        } else if (mode === FormMode.CREATE && items.length === 0 && templates.length > 0) {
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
    }, [mode, initialData, roles, items.length, templates, selectedTemplateId]);

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
                    templateId: selectedTemplateId || undefined,
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
            const templateData = {
                name: newTemplateName.trim(),
                teamId,
                items: items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }))
            };
            await ServingService.createTemplate(teamId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            setNewTemplateName("");
            setIsTemplateDialogOpen(false);
            toast({
                title: "Template saved!",
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
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-gray-50 flex flex-col overflow-y-auto overflow-x-hidden">

            {/* STICKY HEADER - Minimal with Gradient Mask */}
            {/* STICKY HEADER - Minimal with Gradient Mask */}
            <div className="sticky top-0 z-50 w-full px-6 pt-8 pb-8 flex items-center justify-between pointer-events-none bg-gradient-to-b from-background via-background/90 to-transparent">
                {/* Exit Button - Left aligned */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/50 hover:bg-background shadow-sm pointer-events-auto backdrop-blur-sm"
                    onClick={() => router.back()}
                >
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
                                <Label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step 1</Label>
                                <h2 className="text-3xl font-black text-foreground tracking-tight">Select Date</h2>
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
                                <Label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step 2</Label>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assign Roles</h2>
                            </div>

                            <div className="space-y-4">
                                {roles.map(role => {
                                    const ptItem = items.find(item => item.title === '찬양팀 구성');
                                    const assignment = ptItem?.assignments.find(a => a.roleId === role.id);
                                    const memberIds = assignment?.memberIds || [];

                                    const handleAddMember = (uid: string) => {
                                        let newItems = [...items];
                                        let ptItemIdx = newItems.findIndex(i => i.title === '찬양팀 구성');
                                        if (ptItemIdx === -1) {
                                            newItems.push({
                                                id: Math.random().toString(36).substr(2, 9),
                                                order: items.length,
                                                title: '찬양팀 구성',
                                                assignments: [],
                                                type: 'FLOW'
                                            });
                                            ptItemIdx = newItems.length - 1;
                                        }

                                        const newAssignments = [...newItems[ptItemIdx].assignments];
                                        let aIdx = newAssignments.findIndex(a => a.roleId === role.id);
                                        if (aIdx === -1) {
                                            newAssignments.push({ roleId: role.id, memberIds: [uid] });
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

                                    return (
                                        <ServingCard key={role.id}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-foreground">{role.name}</h3>
                                                    <p className="text-sm text-muted-foreground font-medium">
                                                        {memberIds.length > 0 ? `${memberIds.length} members assigned` : "No one assigned"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                        onClick={() => setDeleteConfirm({ type: 'role', id: role.id, open: true })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => {
                                                            let newItems = [...items];
                                                            let ptItemIdx = newItems.findIndex(i => i.title === '찬양팀 구성');
                                                            if (ptItemIdx === -1) {
                                                                newItems.push({
                                                                    id: Math.random().toString(36).substr(2, 9),
                                                                    order: items.length,
                                                                    title: '찬양팀 구성',
                                                                    assignments: [],
                                                                    type: 'FLOW'
                                                                });
                                                                ptItemIdx = newItems.length - 1;
                                                            }

                                                            const newAssignments = [...newItems[ptItemIdx].assignments];
                                                            let aIdx = newAssignments.findIndex(a => a.roleId === role.id);
                                                            if (aIdx === -1) {
                                                                newAssignments.push({ roleId: role.id, memberIds: [] });
                                                                aIdx = newAssignments.length - 1;
                                                            }

                                                            setItems(newItems.map((it, idx) => idx === ptItemIdx ? { ...it, assignments: newAssignments } : it));
                                                            setActiveSelection({ itemId: newItems[ptItemIdx].id, assignmentIndex: aIdx });
                                                        }}
                                                    >
                                                        <UserPlus className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {memberIds.map(uid => (
                                                    <MemberBadge
                                                        key={uid}
                                                        name={getMemberName(uid)}
                                                        onRemove={() => handleAddMember(uid)}
                                                    />
                                                ))}
                                            </div>

                                            <MemberSuggestionList
                                                members={teamMembers
                                                    .filter(m => role.default_members?.includes(m.id))
                                                    .map(m => ({ id: m.id, name: m.name }))
                                                }
                                                selectedIds={memberIds}
                                                onSelect={handleAddMember}
                                            />
                                        </ServingCard>
                                    );
                                })}

                                <AddActionButton
                                    label="Add New Role"
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
                                <Label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step 3</Label>
                                <h2 className="text-3xl font-black text-foreground tracking-tight">Timeline</h2>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Template Header & Actions */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 relative group">
                                            <input
                                                value={templates.find(t => t.id === selectedTemplateId)?.name || ""}
                                                onChange={(e) => handleUpdateTemplateName(e.target.value)}
                                                className="text-2xl font-black bg-transparent border-b-2 border-border/50 focus:border-primary/40 focus:ring-0 p-0 w-full placeholder:text-muted-foreground/50 transition-all hover:border-border"
                                                placeholder="Template Name..."
                                            />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <Pencil className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background shadow-sm border border-border">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-3xl p-2 shadow-2xl border-0">
                                                <DropdownMenuItem
                                                    className={cn("rounded-2xl py-3 cursor-pointer", hasTemplateChanges ? "text-primary font-bold bg-primary/5" : "text-muted-foreground")}
                                                    disabled={!selectedTemplateId || !hasTemplateChanges}
                                                    onClick={handleUpdateTemplate}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save to Current
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="rounded-2xl py-3 cursor-pointer font-bold"
                                                    onClick={() => {
                                                        const currentTemp = templates.find(t => t.id === selectedTemplateId);
                                                        setNewTemplateName(`${currentTemp?.name || "Template"} copy`);
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

                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                                        {templates.map(tmp => (
                                            <Button
                                                key={tmp.id}
                                                variant={selectedTemplateId === tmp.id ? "default" : "outline"}
                                                size="sm"
                                                className="rounded-full text-xs h-9 whitespace-nowrap px-6 shadow-sm"
                                                onClick={() => {
                                                    setSelectedTemplateId(tmp.id);
                                                    setItems(tmp.items.map((it: any, idx: number) => ({
                                                        ...it,
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        order: idx,
                                                        assignments: it.title === '찬양팀 구성'
                                                            ? (items.find(i => i.title === '찬양팀 구성')?.assignments || [])
                                                            : []
                                                    })));
                                                }}
                                            >
                                                {tmp.name}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full text-xs h-9 border-dashed border-2 px-5 text-muted-foreground hover:text-primary transition-colors bg-white/50"
                                            onClick={() => {
                                                setNewTemplateName("");
                                                setIsTemplateDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add
                                        </Button>
                                    </div>
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
                                            {items.sort((a, b) => a.order - b.order).map((item, itemIdx) => (
                                                <ServingCard key={item.id}>
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">{itemIdx + 1}</span>
                                                                <input
                                                                    value={item.title}
                                                                    onChange={(e) => {
                                                                        const newItems = [...items];
                                                                        newItems[itemIdx] = { ...item, title: e.target.value };
                                                                        setItems(newItems);
                                                                    }}
                                                                    className="font-black bg-transparent border-0 focus:ring-0 p-0 text-xl w-full text-foreground"
                                                                    placeholder="Sequence title..."
                                                                />
                                                            </div>
                                                            <input
                                                                value={item.remarks || ""}
                                                                onChange={(e) => {
                                                                    const newItems = [...items];
                                                                    newItems[itemIdx] = { ...item, remarks: e.target.value };
                                                                    setItems(newItems);
                                                                }}
                                                                className="text-sm font-medium text-muted-foreground bg-transparent border-0 focus:ring-0 p-0 w-full"
                                                                placeholder="Add notes or scripture references..."
                                                            />
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                disabled={itemIdx === 0}
                                                                onClick={() => {
                                                                    const newItems = [...items];
                                                                    const target = newItems[itemIdx];
                                                                    newItems[itemIdx] = newItems[itemIdx - 1];
                                                                    newItems[itemIdx - 1] = target;
                                                                    newItems.forEach((it, idx) => it.order = idx);
                                                                    setItems(newItems);
                                                                }}
                                                            >
                                                                <ChevronUp className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                disabled={itemIdx === items.length - 1}
                                                                onClick={() => {
                                                                    const newItems = [...items];
                                                                    const target = newItems[itemIdx];
                                                                    newItems[itemIdx] = newItems[itemIdx + 1];
                                                                    newItems[itemIdx + 1] = target;
                                                                    newItems.forEach((it, idx) => it.order = idx);
                                                                    setItems(newItems);
                                                                }}
                                                            >
                                                                <ChevronDown className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.assignments.map((a, aIdx) => (
                                                                <div key={aIdx} className="flex flex-wrap gap-1.5 p-1 bg-secondary/30 rounded-2xl border border-secondary/50">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1">{roles.find(r => r.id === a.roleId)?.name || 'Role'}</span>
                                                                    {a.memberIds.map(uid => (
                                                                        <MemberBadge
                                                                            key={uid}
                                                                            name={getMemberName(uid)}
                                                                            onRemove={() => {
                                                                                const newItems = [...items];
                                                                                const newAssignments = [...item.assignments];
                                                                                newAssignments[aIdx] = { ...a, memberIds: a.memberIds.filter(id => id !== uid) };
                                                                                newItems[itemIdx] = { ...item, assignments: newAssignments };
                                                                                setItems(newItems);
                                                                            }}
                                                                        />
                                                                    ))}
                                                                    <Button
                                                                        variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0 bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                                                                        onClick={() => setActiveSelection({ itemId: item.id, assignmentIndex: aIdx })}
                                                                    >
                                                                        <UserPlus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0 bg-white shadow-sm"
                                                                onClick={() => {
                                                                    const newItems = [...items];
                                                                    const newAssignments = [...item.assignments, { memberIds: [] }];
                                                                    newItems[itemIdx] = { ...item, assignments: newAssignments };
                                                                    setItems(newItems);
                                                                    setActiveSelection({ itemId: item.id, assignmentIndex: newAssignments.length - 1 });
                                                                }}
                                                            >
                                                                <UserPlus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </ServingCard>
                                            ))}
                                        </>
                                    )}

                                    <AddActionButton
                                        label="Add Sequence"
                                        onClick={() => setItems([...items, { id: Math.random().toString(36).substr(2, 9), order: items.length, title: "", assignments: [], type: 'FLOW' }])}
                                    />
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
                            className="flex flex-col gap-8 w-full pb-10"
                        >
                            <div className="space-y-2 text-center">
                                <Label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Step 4</Label>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Review Plans</h2>
                            </div>

                            <div className="bg-card rounded-[3rem] p-8 shadow-2xl shadow-primary/5 border border-primary/5 space-y-8">
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Event Date</span>
                                    <span className="text-3xl font-black text-foreground leading-none">
                                        {selectedDate && format(selectedDate, "MMM d, yyyy")}
                                    </span>
                                    <span className="text-sm font-bold text-muted-foreground block mt-1">{selectedDate && format(selectedDate, "EEEE")}</span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-2">Timeline Summary</h3>
                                    <div className="bg-secondary/20 rounded-[2rem] border border-border/50 divide-y divide-border/50 overflow-hidden">
                                        {items.filter(item => item.assignments.length > 0).map(item => (
                                            <div key={item.id} className="p-6 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-foreground text-lg">{item.title}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.assignments.map((a, i) => (
                                                        <div key={i} className="flex flex-col gap-1 p-3 bg-background rounded-2xl border border-border/50 min-w-[120px]">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                                                                {a.label || roles.find(r => r.id === a.roleId)?.name}
                                                            </span>
                                                            <span className="text-sm font-bold text-muted-foreground">
                                                                {a.memberIds.map(uid => getMemberName(uid)).join(", ") || "Unassigned"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {items.every(item => item.assignments.length === 0) && (
                                            <div className="p-6 text-center text-muted-foreground text-sm italic">
                                                No specific roles assigned.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* STICKY FOOTER - Minimal with Gradient Mask */}
            <div className="sticky bottom-0 z-50 w-full px-6 pb-8 pt-12 pointer-events-none bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent">
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
                <DrawerContent className="h-[80vh]">
                    <DrawerHeader className="flex items-center justify-between px-6 py-4 border-b">
                        <DrawerTitle className="text-lg font-bold">Select Members</DrawerTitle>
                        {activeSelection && (items.find(i => i.id === activeSelection.itemId)?.assignments[activeSelection.assignmentIndex]?.memberIds.length || 0) > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                onClick={() => {
                                    if (activeSelection) {
                                        const newItems = [...items];
                                        const itemIdx = newItems.findIndex(i => i.id === activeSelection.itemId);
                                        const newAssignments = [...newItems[itemIdx].assignments];
                                        newAssignments[activeSelection.assignmentIndex] = {
                                            ...newAssignments[activeSelection.assignmentIndex],
                                            memberIds: []
                                        };
                                        newItems[itemIdx] = { ...newItems[itemIdx], assignments: newAssignments };
                                        setItems(newItems);
                                    }
                                }}
                            >
                                Unselect All
                            </Button>
                        )}
                    </DrawerHeader>
                    <div className="px-6 py-4 h-full overflow-hidden flex flex-col">
                        {activeSelection && (
                            <MemberSelector
                                selectedMemberIds={items.find(i => i.id === activeSelection.itemId)?.assignments[activeSelection.assignmentIndex]?.memberIds || []}
                                onSelect={(uid) => {
                                    setItems(prev => {
                                        const newItems = [...prev];
                                        const itemIdx = newItems.findIndex(i => i.id === activeSelection.itemId);
                                        if (itemIdx === -1) return prev;

                                        const newAssignments = [...newItems[itemIdx].assignments];
                                        const currentIds = newAssignments[activeSelection.assignmentIndex].memberIds;

                                        if (currentIds.includes(uid)) {
                                            newAssignments[activeSelection.assignmentIndex] = {
                                                ...newAssignments[activeSelection.assignmentIndex],
                                                memberIds: currentIds.filter(id => id !== uid)
                                            };
                                        } else {
                                            newAssignments[activeSelection.assignmentIndex] = {
                                                ...newAssignments[activeSelection.assignmentIndex],
                                                memberIds: [...currentIds, uid]
                                            };
                                        }

                                        newItems[itemIdx] = { ...newItems[itemIdx], assignments: newAssignments };
                                        return newItems;
                                    });
                                }}
                                multiple={true}
                            />
                        )}
                        <Button className="w-full mt-4" onClick={() => setActiveSelection(null)}>
                            Done
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
            {/* Role Creation Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
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
            </Dialog>

            {/* Template Saving Dialog */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-0 shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Save className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">Save Template</DialogTitle>
                        <p className="text-sm text-center text-muted-foreground font-medium leading-relaxed">
                            Save this timeline as a template to reuse it for future worship services.
                        </p>
                    </DialogHeader>
                    <div className="py-6">
                        <Input
                            placeholder="e.g. Sunday Morning Worship"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            onKeyDown={(e) => {
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
                            Save
                        </Button>
                    </DialogFooter>
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
        </div>
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
