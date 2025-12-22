"use client";

import React, { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { servingRolesAtom, fetchServingRolesSelector, servingSchedulesAtom, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { auth } from "@/firebase";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, nextSunday } from "date-fns";
import { ArrowLeft, ArrowRight, ChevronLeft, Check, FileText, MoreHorizontal, Info, Plus, Trash2, GripVertical, Save, ChevronUp, ChevronDown, UserPlus, Pencil } from "lucide-react";
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


interface Props {
    teamId: string;
    mode?: FormMode;
    initialData?: ServingSchedule;
}

const SAMPLE_FLOW: Partial<ServingItem>[] = [
    { title: '예배의 부르심', type: 'FLOW' },
    { title: '교독문', type: 'FLOW' },
    { title: '기도', type: 'FLOW' },
    { title: '찬양팀 구성', type: 'FLOW' },
    { title: '설교', type: 'FLOW' },
    { title: '봉헌 및 광고', type: 'FLOW' },
    { title: '축도', type: 'FLOW' },
    { title: '자막/영상', type: 'SUPPORT' },
    { title: '음향', type: 'SUPPORT' },
];

export function ServingForm({ teamId, mode = FormMode.CREATE, initialData }: Props) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // Recoil
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);
    const setRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);

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

    // Dialog States
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");

    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    // Initialize roles & data
    useEffect(() => {
        if (teamId) {
            ServingService.initStandardRoles(teamId)
                .then(() => setRolesUpdater(prev => prev + 1))
                .catch(console.error);

            const loadInitialData = async () => {
                let data = await ServingService.getTemplates(teamId);

                // 1. Auto-initialize "예배" template if empty
                if (data.length === 0) {
                    const defaultTemplate = {
                        name: "예배",
                        teamId,
                        items: SAMPLE_FLOW.map(i => ({ title: i.title, type: i.type, remarks: "" }))
                    };
                    await ServingService.createTemplate(teamId, defaultTemplate);
                    data = await ServingService.getTemplates(teamId);
                }
                setTemplates(data);

                // 2. Track last used template from recent schedule
                const latestSchedules = await ServingService.getRecentSchedules(teamId, 5);
                const lastUsedTemplateId = latestSchedules.find(s => s.templateId)?.templateId;
                if (lastUsedTemplateId) {
                    setSelectedTemplateId(lastUsedTemplateId);
                }

                setIsTemplatesLoaded(true);
            };

            loadInitialData().catch(console.error);
        }
    }, [teamId, setRolesUpdater]); // Only run when teamId changes

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
        } else if (mode === FormMode.CREATE && items.length === 0 && isTemplatesLoaded) {
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
    }, [mode, initialData, roles, items.length, isTemplatesLoaded, templates, selectedTemplateId]);

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
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await ServingService.deleteTemplate(teamId, selectedTemplateId);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            setSelectedTemplateId(newTemps.length > 0 ? newTemps[0].id : null);
            toast({ title: "Template deleted" });
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

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 0.95,
            position: 'absolute' as const
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            position: 'relative' as const
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 0.95,
            position: 'absolute' as const
        })
    };

    return (
        <div className="fixed inset-0 z-[40] bg-gray-50 flex flex-col items-center justify-center overflow-hidden">

            {/* Header Progress */}
            <div className="fixed top-8 left-0 right-0 z-50 px-6 flex flex-col items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white/20">
                    {["When", "Who", "What", "Review"].map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToStep(idx)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                step === idx
                                    ? "bg-black text-white shadow-md scale-105"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-xl h-full px-4 sm:px-6 pt-24 pb-20 flex flex-col relative perspective-1000">
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>

                    {/* Step 1: Date */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col justify-center space-y-8 w-full"
                        >
                            <div className="space-y-4 text-center">
                                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 1</Label>
                                <h2 className="text-2xl font-bold text-gray-900">When is the Service?</h2>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md"
                                />
                            </div>

                            <Button
                                className="h-14 w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl mt-auto transition-transform active:scale-95"
                                onClick={nextStep}
                                disabled={!selectedDate}
                            >
                                Next Step <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Who (Praise Team Assignment) */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col h-full space-y-4 w-full min-h-0"
                        >
                            <div className="text-center shrink-0">
                                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 2</Label>
                                <h2 className="text-2xl font-bold text-gray-900">Assign Roles</h2>
                            </div>

                            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
                                    {roles.map((role) => {
                                        const assignments = items.find(i => i.title === '찬양팀 구성')?.assignments || [];
                                        const roleAssignment = assignments.find(a => a.roleId === role.id);
                                        const memberIds = roleAssignment?.memberIds || [];

                                        return (
                                            <div key={role.id} className="p-4 rounded-2xl border bg-card hover:border-primary/30 transition-all shadow-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-800">{role.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-full p-0 bg-muted/50"
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
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {memberIds.map(uid => (
                                                        <Badge key={uid} className="px-3 py-1 bg-primary/10 text-primary border-0 rounded-full text-xs">
                                                            {getMemberName(uid)}
                                                        </Badge>
                                                    ))}
                                                    {memberIds.length === 0 && (
                                                        <span className="text-xs text-muted-foreground italic">No one assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Quick Role Add */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-10 border-dashed border-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-xl text-xs"
                                        onClick={() => setIsRoleDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add New Role
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto shrink-0 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    className="h-14 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                                    onClick={nextStep}
                                >
                                    Build Timeline <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: What (Worship Timeline) */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col h-full space-y-3 w-full min-h-0"
                        >
                            <div className="text-center shrink-0">
                                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 3</Label>
                                <h2 className="text-2xl font-bold text-gray-900">Worship Timeline</h2>
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col gap-4">
                                {/* Template Header & Actions */}
                                <div className="flex flex-col gap-3 px-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 relative group">
                                            <input
                                                value={templates.find(t => t.id === selectedTemplateId)?.name || ""}
                                                onChange={(e) => handleUpdateTemplateName(e.target.value)}
                                                className="text-2xl font-black bg-transparent border-b-2 border-gray-100 focus:border-primary/40 focus:ring-0 p-0 w-full placeholder:text-gray-300 transition-all hover:border-gray-300"
                                                placeholder="Template Name..."
                                            />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <Pencil className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                                <DropdownMenuItem
                                                    className={cn("rounded-xl py-2 cursor-pointer", hasTemplateChanges ? "text-primary font-bold" : "text-muted-foreground")}
                                                    disabled={!selectedTemplateId || !hasTemplateChanges}
                                                    onClick={handleUpdateTemplate}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save to Current
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="rounded-xl py-2 cursor-pointer font-medium"
                                                    onClick={() => {
                                                        const currentTemp = templates.find(t => t.id === selectedTemplateId);
                                                        setNewTemplateName(`${currentTemp?.name || "Template"} copy`);
                                                        setIsTemplateDialogOpen(true);
                                                    }}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Save as New
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="rounded-xl py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={handleDeleteTemplate}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Template
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {templates.map(tmp => (
                                            <Button
                                                key={tmp.id}
                                                variant={selectedTemplateId === tmp.id ? "default" : "outline"}
                                                size="sm"
                                                className="rounded-full text-[10px] h-7 whitespace-nowrap px-4"
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
                                            className="rounded-full text-[10px] h-7 border-dashed border px-3 text-muted-foreground hover:text-primary transition-colors"
                                            onClick={() => {
                                                setNewTemplateName("");
                                                setIsTemplateDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-0">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                                        {!isTemplatesLoaded ? (
                                            // Loading Skeletons
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className="animate-pulse p-4 rounded-2xl border bg-card space-y-3">
                                                    <div className="h-4 bg-muted rounded w-1/3" />
                                                    <div className="h-3 bg-muted rounded w-1/2" />
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                {templates.length === 0 && (
                                                    <div className="px-2 py-4 mb-2 bg-primary/5 rounded-2xl border border-primary/10 border-dashed text-center">
                                                        <p className="text-xs font-bold text-primary mb-1">✨ Sample Flow Ready</p>
                                                        <p className="text-[10px] text-muted-foreground leading-tight px-4">
                                                            No templates found in DB. We&apos;ve prepared a sample flow to get you started!
                                                        </p>
                                                    </div>
                                                )}
                                                {items.sort((a, b) => a.order - b.order).map((item, itemIdx) => (
                                                    <div
                                                        key={item.id}
                                                        className="group flex flex-col gap-3 p-4 rounded-2xl border bg-card hover:border-primary/30 transition-all shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{itemIdx + 1}</span>
                                                                    <input
                                                                        id={`item-title-${item.id}`}
                                                                        name={`item-title-${item.id}`}
                                                                        value={item.title}
                                                                        onChange={(e) => {
                                                                            const newItems = [...items];
                                                                            newItems[itemIdx] = { ...item, title: e.target.value };
                                                                            setItems(newItems);
                                                                        }}
                                                                        className="font-bold bg-transparent border-0 focus:ring-0 p-0 text-lg w-full"
                                                                        placeholder="Order title..."
                                                                    />
                                                                </div>
                                                                <input
                                                                    id={`item-remarks-${item.id}`}
                                                                    name={`item-remarks-${item.id}`}
                                                                    value={item.remarks || ""}
                                                                    onChange={(e) => {
                                                                        const newItems = [...items];
                                                                        newItems[itemIdx] = { ...item, remarks: e.target.value };
                                                                        setItems(newItems);
                                                                    }}
                                                                    className="text-xs text-muted-foreground bg-transparent border-0 focus:ring-0 p-0 w-full"
                                                                    placeholder="Notes/Scripture..."
                                                                />
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 rounded-full"
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
                                                                        <ChevronUp className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 rounded-full"
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
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Assignments for this item */}
                                                        <div className="space-y-2">
                                                            {item.assignments.map((assignment, aIdx) => (
                                                                <div key={aIdx} className="flex flex-wrap items-center gap-2">
                                                                    <Badge variant="outline" className="h-7 px-2 py-0 font-normal border-dashed">
                                                                        {assignment.label || roles.find(r => r.id === assignment.roleId)?.name || "Role"}
                                                                    </Badge>
                                                                    {assignment.memberIds.map(uid => (
                                                                        <Badge key={uid} className="h-7 px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                                                            {getMemberName(uid)}
                                                                            <button className="ml-1 hover:text-destructive" onClick={() => {
                                                                                const newItems = [...items];
                                                                                const newAssignments = [...item.assignments];
                                                                                newAssignments[aIdx] = { ...assignment, memberIds: assignment.memberIds.filter(id => id !== uid) };
                                                                                newItems[itemIdx] = { ...item, assignments: newAssignments };
                                                                                setItems(newItems);
                                                                            }}>&times;</button>
                                                                        </Badge>
                                                                    ))}
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full p-0 bg-muted/50" onClick={() => setActiveSelection({ itemId: item.id, assignmentIndex: aIdx })}>
                                                                        <UserPlus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:bg-muted"
                                                                onClick={() => {
                                                                    const newItems = [...items];
                                                                    const newAssignments = [...item.assignments, { memberIds: [] }];
                                                                    newItems[itemIdx] = { ...item, assignments: newAssignments };
                                                                    setItems(newItems);
                                                                    setActiveSelection({ itemId: item.id, assignmentIndex: newAssignments.length - 1 });
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3 mr-1" /> Add Person
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        <Button
                                            variant="outline" className="w-full h-12 rounded-2xl border-dashed border-2 hover:bg-muted/50 border-muted-foreground/20 text-muted-foreground"
                                            onClick={() => setItems([...items, { id: Math.random().toString(36).substr(2, 9), order: items.length, title: "", assignments: [], type: 'FLOW' }])}>
                                            <Plus className="w-5 h-5 mr-2" /> Add Sequence
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto shrink-0 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    className="h-14 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                                    onClick={nextStep}
                                >
                                    Review Plan <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Review */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col h-full w-full"
                        >
                            <div className="flex-1 flex flex-col min-h-0 justify-center py-4 space-y-6">
                                <div className="space-y-4 text-center shrink-0">
                                    <Label className="text-sm font-bold text-primary uppercase tracking-wider">Final Step</Label>
                                    <h2 className="text-2xl font-bold text-gray-900">Review Timeline</h2>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col min-h-0 space-y-6 max-h-full">
                                    <div className="text-center shrink-0">
                                        <span className="text-sm text-muted-foreground block mb-1">Service Date</span>
                                        <span className="text-2xl font-bold">
                                            {selectedDate && format(selectedDate, "MMM d, yyyy (EEE)")}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-hidden">
                                        <h3 className="font-medium text-sm text-muted-foreground shrink-0">Timeline Summary</h3>
                                        <div className="divide-y border rounded-xl overflow-y-auto overscroll-contain">
                                            {items.filter(item => item.assignments.length > 0).map(item => (
                                                <div key={item.id} className="p-3 space-y-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-bold">{item.title}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.assignments.map((a, i) => (
                                                            <span key={i} className="text-xs text-muted-foreground">
                                                                <span className="font-medium">{a.label || roles.find(r => r.id === a.roleId)?.name}:</span> {a.memberIds.map(uid => getMemberName(uid)).join(", ")}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {items.every(item => item.assignments.length === 0) && (
                                                <div className="p-4 text-center text-muted-foreground text-sm italic">
                                                    No specific roles assigned.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto shrink-0 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="h-14 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                                >
                                    {isLoading ? "Saving..." : (mode === FormMode.CREATE ? "Create Schedule" : "Update Schedule")} <Check className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
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
                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 px-5 text-lg font-medium shadow-inner focus:bg-white transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="flex sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            className="h-12 flex-1 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
        </div>
    );
}
