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
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronUp, ChevronDown, Check, UserPlus, Save } from "lucide-react";
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
import { Plus, Trash2, GripVertical } from "lucide-react";


interface Props {
    teamId: string;
    mode?: FormMode;
    initialData?: ServingSchedule;
}

const PRAISE_TEAM_ROLES = [
    { id: 'leader', label: '찬양인도' },
    { id: 'piano', label: '건반' },
    { id: 'synth', label: '신디' },
    { id: 'drum', label: '드럼' },
    { id: 'bass', label: '베이스' },
    { id: 'electric', label: '일렉기타' },
    { id: 'singer', label: '싱어' },
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
    const [step, setStep] = useState(0); // 0: Date, 1: Flow, 2: Review
    const [direction, setDirection] = useState(0);
    const totalSteps = 3;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(nextSunday(new Date()));
    const [items, setItems] = useState<ServingItem[]>([]);

    // For Member Selection Drawer
    const [activeSelection, setActiveSelection] = useState<{
        itemId: string;
        assignmentIndex: number;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Initialize roles & data
    useEffect(() => {
        if (teamId) {
            ServingService.initStandardRoles(teamId)
                .then(() => setRolesUpdater(prev => prev + 1))
                .catch(console.error);
        }

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
        } else if (mode === FormMode.CREATE) {
            // Default Flow Template
            const defaultFlow: Partial<ServingItem>[] = [
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
            setItems(defaultFlow.map((item, idx) => ({
                id: Math.random().toString(36).substr(2, 9),
                order: idx,
                title: item.title || '',
                assignments: [] as ServingAssignment[],
                type: item.type as 'FLOW' | 'SUPPORT',
            })));
        }
    }, [teamId, setRolesUpdater, mode, initialData, roles]);

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
                    {["When", "Who", "Review"].map((label, idx) => (
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

                    {/* Step 1: Flow / Cue Sheet Builder */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex-1 flex flex-col h-full space-y-3 w-full"
                        >
                            <div className="text-center pb-2">
                                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 2</Label>
                                <h2 className="text-2xl font-bold text-gray-900">Worship Timeline</h2>
                            </div>

                            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
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
                                                                // Update orders
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
                                                                // Update orders
                                                                newItems.forEach((it, idx) => it.order = idx);
                                                                setItems(newItems);
                                                            }}
                                                        >
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                                        onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Assignments List */}
                                            <div className="space-y-2">
                                                {item.assignments.map((assignment, aIdx) => (
                                                    <div key={aIdx} className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline" className="h-7 px-2 py-0 font-normal border-dashed">
                                                            {assignment.label || roles.find(r => r.id === assignment.roleId)?.name || "Role"}
                                                        </Badge>

                                                        {assignment.memberIds.map(uid => (
                                                            <Badge key={uid} className="h-7 px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                                                {getMemberName(uid)}
                                                                <button
                                                                    className="ml-1 hover:text-destructive"
                                                                    onClick={() => {
                                                                        const newItems = [...items];
                                                                        const newAssignments = [...item.assignments];
                                                                        newAssignments[aIdx] = {
                                                                            ...assignment,
                                                                            memberIds: assignment.memberIds.filter(id => id !== uid)
                                                                        };
                                                                        newItems[itemIdx] = { ...item, assignments: newAssignments };
                                                                        setItems(newItems);
                                                                    }}
                                                                >
                                                                    &times;
                                                                </button>
                                                            </Badge>
                                                        ))}

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 rounded-full p-0 bg-muted/50"
                                                            onClick={() => setActiveSelection({ itemId: item.id, assignmentIndex: aIdx })}
                                                        >
                                                            <UserPlus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}

                                                {/* Add Role / Member Trigger */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:bg-muted"
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

                                                    {item.title.includes('찬양팀') && item.assignments.length === 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5"
                                                            onClick={() => {
                                                                const newItems = [...items];
                                                                newItems[itemIdx] = {
                                                                    ...item,
                                                                    assignments: PRAISE_TEAM_ROLES.map((r): ServingAssignment => ({ label: r.label, memberIds: [] }))
                                                                };
                                                                setItems(newItems);
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Praise Team Preset
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-2xl border-dashed border-2 hover:bg-muted/50 border-muted-foreground/20 text-muted-foreground"
                                        onClick={() => setItems([...items, {
                                            id: Math.random().toString(36).substr(2, 9),
                                            order: items.length,
                                            title: "",
                                            assignments: [],
                                            type: 'FLOW'
                                        }])}
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Add Sequence
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    className="h-14 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                                    onClick={nextStep}
                                >
                                    Review <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Review */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
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
        </div>
    );
}
