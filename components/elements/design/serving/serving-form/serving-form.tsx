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
import { ArrowLeft, ArrowRight, ChevronLeft, Check, UserPlus, Save } from "lucide-react";
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
import { ServingSchedule } from "@/models/serving";

interface Props {
    teamId: string;
    mode?: FormMode;
    initialData?: ServingSchedule;
}

export function ServingForm({ teamId, mode = FormMode.CREATE, initialData }: Props) {
    const router = useRouter();
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // Recoil
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);
    const setRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);

    // Form State
    const [step, setStep] = useState(0); // 0: Date, 1: Roles, 2: Review
    const [direction, setDirection] = useState(0);
    const totalSteps = 3;

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(nextSunday(new Date()));
    const [roleAssignments, setRoleAssignments] = useState<Record<string, string[]>>({}); // roleId -> memberIds[]
    const [activeRoleForSelection, setActiveRoleForSelection] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize roles & data
    useEffect(() => {
        if (teamId) {
            ServingService.initStandardRoles(teamId)
                .then(() => setRolesUpdater(prev => prev + 1))
                .catch(console.error);
        }

        if (mode === FormMode.EDIT && initialData) {
            // Pre-fill data
            const date = new Date(initialData.date);
            // Adjust for timezone offset if necessary, but usually date string yyyy-MM-dd is parsed to local midnight or UTC
            // Here assuming standard string parsing is sufficient or explicit adjustment needed
            // Actually, "2024-05-01" -> new Date("2024-05-01") is usually UTC based in some envs or Local in others.
            // Safest to parse yyyy-MM-dd parts.
            const [y, m, d] = initialData.date.split('-').map(Number);
            const parsedDate = new Date(y, m - 1, d);

            setSelectedDate(parsedDate);

            const assignments: Record<string, string[]> = {};
            initialData.roles.forEach(r => {
                assignments[r.roleId] = r.memberIds;
            });
            setRoleAssignments(assignments);
        }
    }, [teamId, setRolesUpdater, mode, initialData]);

    // Helpers
    const getMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || "Unknown";

    const handleSubmit = async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        try {
            const dateString = format(selectedDate, "yyyy-MM-dd");
            const rolesData = Object.entries(roleAssignments).map(([roleId, memberIds]) => ({
                roleId,
                memberIds,
            }));

            if (mode === FormMode.CREATE) {
                const payload = {
                    teamId,
                    date: dateString,
                    roles: rolesData,
                };
                await ServingService.createSchedule(teamId, payload);

                // Notify assigned members
                const allAssignedMembers = Array.from(new Set(
                    Object.values(roleAssignments).flat()
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
                const payload = {
                    ...initialData,
                    date: dateString,
                    roles: rolesData,
                };
                await ServingService.updateSchedule(teamId, payload);
                toast({ title: "Schedule updated!" });
            }

            // Optimistic update / Refetch
            const newSchedule = await ServingService.getScheduleByDate(teamId, dateString);
            if (newSchedule) {
                // Determine how to update atom - simplification: just refetch list or append
                // Ideally replace item if edit
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

                    {/* Step 2: Roles */}
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
                                <h2 className="text-2xl font-bold text-gray-900">Assign Roles</h2>
                            </div>

                            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 overscroll-contain">
                                    {roles.map((role) => {
                                        const assignedIds = roleAssignments[role.id] || [];
                                        return (
                                            <div
                                                key={role.id}
                                                className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => setActiveRoleForSelection(role.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{role.name}</span>
                                                    {assignedIds.length === 0 ? (
                                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {assignedIds.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {assignedIds.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {assignedIds.map(uid => (
                                                            <span key={uid} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                                {getMemberName(uid)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                    <h2 className="text-2xl font-bold text-gray-900">Review Schedule</h2>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col min-h-0 space-y-6 max-h-full">
                                    <div className="text-center shrink-0">
                                        <span className="text-sm text-muted-foreground block mb-1">Date</span>
                                        <span className="text-2xl font-bold">
                                            {selectedDate && format(selectedDate, "MMM d, yyyy (EEE)")}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-hidden">
                                        <h3 className="font-medium text-sm text-muted-foreground shrink-0">Assignments</h3>
                                        <div className="divide-y border rounded-xl overflow-y-auto overscroll-contain">
                                            {roles.filter(r => (roleAssignments[r.id]?.length || 0) > 0).map(role => (
                                                <div key={role.id} className="p-3 flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">{role.name}</span>
                                                    <span className="font-medium text-right">
                                                        {roleAssignments[role.id].map(uid => getMemberName(uid)).join(", ")}
                                                    </span>
                                                </div>
                                            ))}
                                            {Object.keys(roleAssignments).length === 0 && (
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
            <Drawer open={!!activeRoleForSelection} onOpenChange={(open) => !open && setActiveRoleForSelection(null)}>
                <DrawerContent className="h-[70vh]">
                    <DrawerHeader>
                        <DrawerTitle>Select Members</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pt-0 h-full overflow-hidden flex flex-col">
                        <MemberSelector
                            selectedMemberIds={activeRoleForSelection ? (roleAssignments[activeRoleForSelection] || []) : []}
                            onSelect={(uid) => {
                                if (!activeRoleForSelection) return;
                                setRoleAssignments(prev => {
                                    const current = prev[activeRoleForSelection] || [];
                                    const exists = current.includes(uid);
                                    if (exists) {
                                        return { ...prev, [activeRoleForSelection]: current.filter(id => id !== uid) };
                                    } else {
                                        return { ...prev, [activeRoleForSelection]: [...current, uid] };
                                    }
                                });
                            }}
                            multiple={true}
                        />
                        <Button className="w-full mt-4" onClick={() => setActiveRoleForSelection(null)}>
                            Done
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
