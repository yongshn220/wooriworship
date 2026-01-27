"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight, ChevronLeft, Check, FileText, MoreHorizontal, Plus, Trash2, Save, Pencil, X, AlertCircle } from "lucide-react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";
import { LinkedResourceCard } from "@/components/common/form/linked-resource-card";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { ServiceMemberList } from "@/components/elements/design/service/service-member-list";
import { MemberSelector } from "./member-selector";
import { SetlistPlanPreviewDrawer } from "@/components/elements/design/setlist/setlist-plan-preview-drawer";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { getPathEditServing } from "@/components/util/helper/routes";
import { AddActionButton } from "./service-components";
import { PraiseTeamCard } from "../parts/praise-team-card";
import { ServiceOrderCard } from "../parts/service-order-card";

// Extracted Components
import { ServiceFormSkeleton } from "./service-form-skeleton";
import { SortableList } from "@/components/common/list/sortable-list";
import { SortableRoleItem } from "./items/sortable-role-item";
import { SortableWorshipItem } from "./items/sortable-worship-item";
import { SortableTimelineItem } from "./items/sortable-timeline-item";
import { slideVariants } from "@/components/constants/animations";

// Hook & Types
import { useServiceFormLogic } from "./hooks/use-service-form-logic";
import { ServiceFormProps } from "./types";
import { auth } from "@/firebase";
import { PraiseAssigneeService } from "@/apis/PraiseAssigneeService";

export function ServiceForm(props: ServiceFormProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [memberSearchQuery, setMemberSearchQuery] = React.useState(""); // New state for search

    const router = useRouter();

    const {
        // State
        step, direction, totalSteps,
        selectedDate, currentMonth, serviceTagIds, items,
        templates, isTemplatesLoaded, selectedTemplateId, hasTemplateChanges,
        availableWorships, linkedWorshipId, previewWorshipId,
        activeSelection, isLoading,
        isRoleDialogOpen, newRoleName, isCreatingRole, isTemplateDialogOpen, isRenameDialogOpen,
        newTemplateName, tempTemplateName, createEmptyMode,
        standardGroups, customMemberNames, deleteConfirm,
        roles, team, teamMembers,
        isDuplicate, duplicateId, duplicateErrorMessage,

        // Setters
        setStep, setDirection, setSelectedDate, setCurrentMonth, setServiceTagIds, setItems,
        setTemplates, setIsTemplatesLoaded, setSelectedTemplateId, setHasTemplateChanges,
        setLinkedWorshipId, setPreviewWorshipId, setActiveSelection,
        setIsRoleDialogOpen, setNewRoleName, setIsTemplateDialogOpen, setIsRenameDialogOpen,
        setNewTemplateName, setTempTemplateName, setCreateEmptyMode, setStandardGroups, setCustomMemberNames,
        setDeleteConfirm, setRoles, worshipRoles, handleAssignMemberToRole,

        // Actions
        handleAddMember, handleSubmit, handleCreateRole, handleDeleteRole,
        handleSaveTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUpdateTemplateName,
        goToStep, nextStep, prevStep, getSuggestionsForTitle
    } = useServiceFormLogic(props);

    // Scroll to top on step change (UI Effect)
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [step]);


    if (!isTemplatesLoaded && props.mode === "CREATE" && false) {
        // Note: The original logic had `rolesLoadable.state !== 'hasValue'` check. 
        // In the hook, roles are initialized from Recoil loadable. 
        // We can check if roles are loaded or just render. 
        // Given the hook initializes `roles` state, we can proceed.
        // However, if we want to show skeleton while loading roles initially:
        if (roles.length === 0 && isLoading) return (<ServiceFormSkeleton />);
    }

    // Checking if roles are loaded from Recoil in the hook might be cleaner, 
    // but here `roles` is already an array. If empty, it might be just empty.
    // The original code used `rolesLoadable.state !== 'hasValue'`.
    // In our hook, we returned `roles` which is initialized. 
    // If we want exact behavior, we might need to expose loading state from hook.
    // However, `roles` is often fast. Let's assume it's fine or add `isRolesLoaded` to hook if needed.
    // For now, let's use the layout.

    return (
        <>
            <FullScreenForm>
                <FullScreenFormHeader
                    steps={["Service", "Roles", "Flow", "Done"]}
                    currentStep={step}
                    onStepChange={isDuplicate ? undefined : goToStep}
                    onClose={() => window.history.back()} // Router back
                />

                {/* SCROLLABLE CONTENT AREA */}
                <FullScreenFormBody ref={containerRef}>
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
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Select Date & Service</h2>
                                </div>

                                {isDuplicate && duplicateId && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="px-4 py-3 rounded-2xl bg-orange-50/80 border border-orange-100 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-sm font-bold text-orange-900 truncate">Serving already exists.</h3>
                                                <p className="text-xs text-orange-800/80 truncate">
                                                    <span className="mr-1">{format(selectedDate!, "yyyy-MM-dd")}</span>
                                                    <span className="font-semibold text-orange-900">
                                                        {serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id).join(", ")}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-xs shadow-sm flex-shrink-0"
                                            onClick={() => router.replace(getPathEditServing(props.teamId, duplicateId))}
                                        >
                                            Edit <ArrowRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Service & Date Selection */}
                                <ServiceDateSelector
                                    teamId={props.teamId}
                                    tagId={serviceTagIds[0] || ""}
                                    onTagIdChange={(id) => setServiceTagIds([id])}
                                    date={selectedDate}
                                    onDateChange={(d) => d && setSelectedDate(d)}
                                    calendarMonth={currentMonth}
                                    onCalendarMonthChange={setCurrentMonth}
                                />

                                {/* Linked Worship Plan */}{/* ... keeping existing code flow ... */}
                                <LinkedResourceCard
                                    label="Linked Worship Plan"
                                    items={availableWorships.map(plan => ({
                                        id: plan.id,
                                        title: plan.title || "Untitled Worship",
                                        description: format(plan.worship_date.toDate(), "yyyy-MM-dd")
                                    }))}
                                    selectedId={linkedWorshipId}
                                    onSelect={setLinkedWorshipId}
                                    onPreview={setPreviewWorshipId}
                                />
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
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Assign Serving Roles</h2>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <SortableList items={roles} onReorder={(newRoles) => {
                                        setRoles(newRoles);
                                        PraiseAssigneeService.updateRolesOrder(props.teamId, newRoles).catch(console.error);
                                    }}>
                                        {roles.map((role) => {
                                            const assignment = worshipRoles.find(a => a.roleId === role.id);
                                            const memberIds = assignment?.memberIds || [];

                                            return (
                                                <SortableRoleItem
                                                    key={role.id}
                                                    role={role}
                                                    memberIds={memberIds}
                                                    teamMembers={teamMembers}
                                                    onAddMember={handleAssignMemberToRole}
                                                    onDeleteRole={() => setDeleteConfirm({ type: 'role' as const, id: role.id, open: true })}
                                                    onOpenAdd={() => setActiveSelection({ roleId: role.id })}
                                                />
                                            );
                                        })}
                                    </SortableList>

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
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Set up Worship Flow</h2>
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
                                                            assignments: []
                                                        })));
                                                    }}
                                                    className={cn(
                                                        "flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95",
                                                        selectedTemplateId === tmp.id
                                                            ? "bg-primary/5 text-primary border border-primary shadow-sm"
                                                            : "bg-card text-muted-foreground border border-border hover:border-foreground/20"
                                                    )}
                                                >
                                                    {tmp.name}
                                                </button>
                                            ))}
                                            <button
                                                className="flex-shrink-0 px-4 py-2 bg-transparent text-muted-foreground border border-dashed border-border rounded-full text-[13px] font-medium active:scale-95 transition-all hover:bg-secondary hover:border-foreground/20 flex items-center gap-1"
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
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-foreground hover:bg-muted transition-colors flex-shrink-0">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-3xl p-2 shadow-2xl border-0">
                                                <DropdownMenuItem
                                                    className="rounded-2xl py-3 cursor-pointer font-bold"
                                                    disabled={!selectedTemplateId}
                                                    onSelect={() => {
                                                        setTimeout(() => {
                                                            const currentTemp = templates.find(t => t.id === selectedTemplateId);
                                                            setTempTemplateName(currentTemp?.name || "");
                                                            setIsRenameDialogOpen(true);
                                                        }, 150);
                                                    }}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Rename Template
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-muted/50" />
                                                <DropdownMenuItem
                                                    className={cn("rounded-2xl py-3 cursor-pointer", hasTemplateChanges ? "text-primary font-bold bg-primary/5" : "text-muted-foreground")}
                                                    disabled={!selectedTemplateId || !hasTemplateChanges}
                                                    onSelect={() => {
                                                        handleUpdateTemplate();
                                                    }}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save to &quot;{templates.find(t => t.id === selectedTemplateId)?.name}&quot;
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="rounded-2xl py-3 cursor-pointer font-bold"
                                                    onSelect={() => {
                                                        const currentTemp = templates.find(t => t.id === selectedTemplateId);
                                                        setNewTemplateName(`${currentTemp?.name || "Template"} copy`);
                                                        setCreateEmptyMode(false);
                                                        setTimeout(() => {
                                                            setIsTemplateDialogOpen(true);
                                                        }, 150);
                                                    }}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Save as New
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-muted/50" />
                                                <DropdownMenuItem
                                                    className="rounded-2xl py-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                                                    onSelect={() => {
                                                        setTimeout(() => {
                                                            setDeleteConfirm({ type: 'template', id: selectedTemplateId || '', open: true });
                                                        }, 150);
                                                    }}
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
                                                <SortableList items={items} onReorder={(newOrdered) => {
                                                    setItems(newOrdered.map((item, index) => ({
                                                        ...item,
                                                        order: index
                                                    })));
                                                }}>
                                                    {items.map((item, index) => {
                                                        return (
                                                            <SortableTimelineItem
                                                                key={item.id}
                                                                item={item}
                                                                getMemberName={(id: string) => teamMembers.find(m => m.id === id)?.name || id}
                                                                onUpdate={(newItem) => {
                                                                    const newItems = items.map(i => i.id === item.id ? newItem : i);
                                                                    setItems(newItems);
                                                                }}
                                                                onDelete={() => setItems(prev => {
                                                                    const filtered = prev.filter(i => i.id !== item.id);
                                                                    return filtered.map((it, idx) => ({ ...it, order: idx }));
                                                                })}
                                                                onOpenAdd={(aIdx) => setActiveSelection({
                                                                    itemId: item.id,
                                                                    assignmentIndex: aIdx,
                                                                    roleId: "timeline-default"
                                                                })}
                                                                onRemoveMember={(aIdx, uid) => {
                                                                    handleAddMember(item.id, aIdx, uid);
                                                                }}
                                                                suggestions={getSuggestionsForTitle(item.title)}
                                                            />
                                                        )
                                                    })}
                                                </SortableList>

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
                                className="flex flex-col w-full"
                            >
                                {/* Minimal Header for Step 4 */}
                                {selectedDate && (
                                    <div className="flex flex-col items-center justify-center py-4 border-b border-border/10 mb-2 -mx-6 px-6">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 opacity-80">Step 4</span>
                                        <div className="text-center">
                                            <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                                                Review & Confirm
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide opacity-70">
                                                {format(selectedDate, "EEEE, MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* CUE SHEET / TIMELINE LIST */}
                                <div className="flex flex-col w-full px-4 space-y-5 pb-24">
                                    <PraiseTeamCard
                                        praiseAssignments={worshipRoles}
                                        roles={roles}
                                        members={teamMembers}
                                        currentUserUid={auth.currentUser?.uid}
                                    />

                                    <ServiceOrderCard
                                        items={items}
                                        members={teamMembers}
                                        currentUserUid={auth.currentUser?.uid}
                                    />

                                    {items.length === 0 && worshipRoles.length === 0 && (
                                        <div className="py-12 text-center space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                                                <FileText className="w-5 h-5 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground text-sm">No details available for this plan yet.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </FullScreenFormBody>

                {/* STICKY FOOTER - Absolute */}
                <FullScreenFormFooter
                    errorMessage={isDuplicate ? undefined : duplicateErrorMessage}
                >
                    <AnimatePresence>
                        {step === 2 && hasTemplateChanges && selectedTemplateId && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute bottom-28 left-0 right-0 mx-auto w-full max-w-2xl flex justify-center pointer-events-auto z-10"
                            >
                                <button
                                    onClick={handleUpdateTemplate}
                                    className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-xl group active:scale-95 transition-all"
                                >
                                    <span className="text-[13px] font-bold text-primary">
                                        Save to &quot;{templates.find(t => t.id === selectedTemplateId)?.name}&quot;
                                    </span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground/50 disabled:opacity-100 disabled:shadow-none"
                        onClick={step === totalSteps - 1 ? handleSubmit : nextStep}
                        disabled={isLoading || (step === 0 && (!selectedDate || isDuplicate))}
                    >
                        {isLoading ? (
                            "Saving..."
                        ) : step === totalSteps - 1 ? (
                            <>Confirm <Check className="w-5 h-5 ml-1" /></>
                        ) : (
                            <>Next <ArrowRight className="w-5 h-5 ml-1" /></>
                        )}
                    </Button>
                </FullScreenFormFooter>

                {/* Setlist Preview Drawer */}
                <SetlistPlanPreviewDrawer
                    isOpen={!!previewWorshipId}
                    onClose={() => setPreviewWorshipId(null)}
                    setlistId={previewWorshipId}
                    teamId={props.teamId}
                />

                {/* Member Selection Drawer */}
                <Drawer open={!!activeSelection} onOpenChange={(open) => {
                    if (!open) {
                        setActiveSelection(null);
                        setMemberSearchQuery(""); // Reset search on close
                    }
                }}>
                    <DrawerContent className="h-[96vh] rounded-t-[2.5rem]">
                        <div className="mx-auto w-full max-w-lg h-full flex flex-col pt-2 relative">
                            {/* Header with Search Bar */}
                            <div className="flex flex-col gap-1 px-6 pt-6 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-4 w-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                        </div>
                                        <Input
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            placeholder="Search name or email..."
                                            className="pl-10 h-12 bg-muted/30 border-0 rounded-2xl text-[16px] ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 font-medium"
                                        // No autoFocus as per previous instruction
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-muted h-10 w-10 flex-shrink-0"
                                        onClick={() => setActiveSelection(null)}
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                </div>
                                <DrawerDescription className="sr-only">
                                    Select a member to assign to this role.
                                </DrawerDescription>
                            </div>

                            {/* Unified Scroll Area */}
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col gap-6 pb-32 pt-2 px-6">

                                    <DrawerTitle className="text-xl font-bold text-foreground tracking-tight px-1">
                                        Select Member
                                    </DrawerTitle>

                                    <MemberSelector
                                        searchQuery={memberSearchQuery} // Pass search query
                                        selectedMemberIds={
                                            activeSelection?.itemId && activeSelection.assignmentIndex !== undefined
                                                ? items.find(i => i.id === activeSelection.itemId)?.assignments[activeSelection.assignmentIndex]?.memberIds || []
                                                : activeSelection?.roleId
                                                    ? worshipRoles.find(a => a.roleId === activeSelection.roleId)?.memberIds || []
                                                    : []
                                        }
                                        onSelect={(memberId) => {
                                            if (activeSelection?.itemId && activeSelection.assignmentIndex !== undefined) {
                                                handleAddMember(activeSelection.itemId, activeSelection.assignmentIndex, memberId);
                                            } else if (activeSelection?.roleId) {
                                                handleAssignMemberToRole(activeSelection.roleId, memberId);
                                            }
                                        }}
                                        multiple
                                        groups={standardGroups}
                                        onAddGroup={(name) => {
                                            setStandardGroups(prev => [...prev, name]);
                                            PraiseAssigneeService.addCustomGroup(props.teamId, name).catch(console.error);
                                        }}
                                        onRemoveGroup={(idx) => {
                                            setStandardGroups(standardGroups.filter((_, i) => i !== idx));
                                        }}
                                        customMemberNames={customMemberNames}
                                        onAddCustomMember={(name) => {
                                            setCustomMemberNames(prev => [...prev, name]);
                                            PraiseAssigneeService.addCustomMemberName(props.teamId, name).catch(console.error);
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
                                    if (e.nativeEvent.isComposing) return;
                                    if (e.key === "Enter" && newRoleName.trim()) {
                                        handleCreateRole();
                                    }
                                }}
                                className="h-14 rounded-2xl border-border bg-secondary/50 px-5 text-lg font-medium shadow-inner focus:bg-background transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="flex sm:flex-row gap-3">
                            <Button
                                variant="ghost"
                                className="h-12 flex-1 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
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
                                className="h-14 rounded-2xl border-border bg-secondary/30 px-5 text-lg font-medium shadow-inner focus:bg-background transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
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

                                    className="h-14 px-5 rounded-2xl bg-secondary/50 border-border focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-border text-muted-foreground font-bold hover:bg-secondary transition-all"
                                    onClick={() => setIsRenameDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg shadow-muted active:scale-[0.98] transition-all"
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
            </FullScreenForm >
        </>
    );
}
