"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Save, UserPlus, X } from "lucide-react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { servingRolesAtom, fetchServingRolesSelector, servingSchedulesAtom } from "@/global-states/servingState";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { ServingService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { MemberSelector } from "./member-selector";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { usersAtom } from "@/global-states/userState";
import { teamAtom } from "@/global-states/teamState";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateScheduleWizard({ open, onOpenChange }: Props) {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));

    // States
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [roleAssignments, setRoleAssignments] = useState<Record<string, string[]>>({}); // roleId -> memberIds[]
    const [activeRoleForSelection, setActiveRoleForSelection] = useState<string | null>(null); // roleId

    // Recoil
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));
    const setSchedules = useSetRecoilState(servingSchedulesAtom);

    // Initialize roles if needed
    useEffect(() => {
        if (open && teamId) {
            ServingService.initStandardRoles(teamId).catch(console.error);
        }
    }, [open, teamId]);

    // Step Navigation
    const handleNext = () => {
        if (step === 1 && !selectedDate) {
            toast({ title: "Please select a date" });
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handleBack = () => setStep((prev) => prev - 1);

    const handleSave = async () => {
        if (!teamId || !selectedDate) return;

        try {
            // Construct payload
            const payload = {
                teamId,
                date: format(selectedDate, "yyyy-MM-dd"),
                roles: Object.entries(roleAssignments).map(([roleId, memberIds]) => ({
                    roleId,
                    memberIds,
                })),
            };

            await ServingService.createSchedule(teamId, payload);

            toast({ title: "Schedule created!" });
            onOpenChange(false);

            // Refresh list (optimistic or re-fetch)
            // For now, re-fetch logic is in parent, but let's just close.
            // Ideally update atom.
            const newSchedule = await ServingService.getScheduleByDate(teamId, payload.date);
            if (newSchedule) {
                setSchedules(prev => [...prev, newSchedule].sort((a, b) => a.date.localeCompare(b.date)));
            }

        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save schedule", variant: "destructive" });
        }
    };

    // Helper to get member name
    const getMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || "Unknown";

    // Reset wizard on close
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setSelectedDate(new Date());
                setRoleAssignments({});
            }, 300);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0 overflow-hidden sm:h-[600px]">

                {/* Header */}
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>
                        {step === 1 && "Select Date"}
                        {step === 2 && "Assign Roles"}
                        {step === 3 && "Review"}
                    </DialogTitle>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">

                    {/* Step 1: Date */}
                    {step === 1 && (
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border shadow"
                            />
                        </div>
                    )}

                    {/* Step 2: Roles */}
                    {step === 2 && (
                        <div className="space-y-3 pb-20">
                            <p className="text-sm text-muted-foreground mb-4">
                                Tap a role to assign members.
                            </p>
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
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-xl text-center">
                                <span className="text-sm text-muted-foreground block mb-1">Date</span>
                                <span className="text-xl font-bold">
                                    {selectedDate && format(selectedDate, "MMM d, yyyy (EEE)")}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-muted-foreground">Assignments</h3>
                                <div className="border rounded-xl divide-y">
                                    {roles.filter(r => (roleAssignments[r.id]?.length || 0) > 0).map(role => (
                                        <div key={role.id} className="p-3 flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{role.name}</span>
                                            <span className="font-medium">
                                                {roleAssignments[role.id].map(uid => getMemberName(uid)).join(", ")}
                                            </span>
                                        </div>
                                    ))}
                                    {Object.keys(roleAssignments).length === 0 && (
                                        <div className="p-4 text-center text-muted-foreground text-sm italic">
                                            No roles assigned.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-background flex justify-between items-center">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button onClick={handleNext} disabled={!selectedDate}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} className="bg-primary text-white">
                            Save <Save className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Member Selection Drawer */}
                <Drawer open={!!activeRoleForSelection} onOpenChange={(open) => !open && setActiveRoleForSelection(null)}>
                    <DrawerContent className="h-[70vh]">
                        <DrawerHeader>
                            <DrawerTitle>Select Members</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 pt-0 h-full overflow-hidden">
                            <MemberSelector
                                selectedMemberIds={activeRoleForSelection ? (roleAssignments[activeRoleForSelection] || []) : []}
                                onSelect={(uid) => {
                                    if (!activeRoleForSelection) return;
                                    setRoleAssignments(prev => {
                                        const current = prev[activeRoleForSelection] || [];
                                        const exists = current.includes(uid);
                                        // Single select or Multi? User said "who is serving", implies one person usually but "assignments" is array.
                                        // I'll assume toggle logic.
                                        if (exists) {
                                            return { ...prev, [activeRoleForSelection]: current.filter(id => id !== uid) };
                                        } else {
                                            return { ...prev, [activeRoleForSelection]: [...current, uid] };
                                        }
                                    });
                                }}
                                multiple={true} // Implementation supports multiple
                            />
                            <Button className="w-full mt-4" onClick={() => setActiveRoleForSelection(null)}>
                                Done
                            </Button>
                        </div>
                    </DrawerContent>
                </Drawer>

            </DialogContent>
        </Dialog>
    );
}
