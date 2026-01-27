"use client"

import React, { useRef, useEffect } from "react";
import { Check, Plus, MoreHorizontal, Pencil, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";
import { cn } from "@/lib/utils";

// Logic & Types
import { useServiceFlowFormLogic } from "./hooks/use-service-flow-form-logic";
import { ServiceFlow } from "@/models/services/ServiceEvent";
import { slideVariants } from "@/components/constants/animations";
import { SortableList } from "@/components/common/list/sortable-list";
import { PraiseAssigneeService } from "@/apis/PraiseAssigneeService";

// Shared Components (Relative Paths updated for new location)
import { SortableTimelineItem } from "../service-form/items/sortable-timeline-item";
import { AddActionButton } from "../service-form/service-components";
import { MemberSelector } from "../service-form/member-selector";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface Props {
    teamId: string;
    serviceId: string;
    initialFlow?: ServiceFlow | null;
    serviceTagIds?: string[];
    onCompleted: () => void;
    onClose: () => void;
}

export function ServiceFlowForm({ teamId, serviceId, initialFlow, serviceTagIds, onCompleted, onClose }: Props) {
    const {
        isLoading,
        items,
        setItems,

        // Timeline State
        activeSelection,
        setActiveSelection,
        standardGroups,
        customMemberNames,
        handleAddMember,
        setStandardGroups,
        setCustomMemberNames,

        // Templates State
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

        // Team
        teamMembers,

        // Actions
        handleSaveTemplate,
        handleUpdateTemplate,
        handleDeleteTemplate,
        handleUpdateTemplateName,
        handleSave,
        getSuggestionsForTitle
    } = useServiceFlowFormLogic({ teamId, serviceId, initialFlow, serviceTagIds, onCompleted });

    // Confirm States for this form
    const [deleteConfirm, setDeleteConfirm] = React.useState<{ type: 'template' | null; id: string | null; open: boolean }>({ type: null, id: null, open: false });
    const [memberSearchQuery, setMemberSearchQuery] = React.useState("");

    return (
        <FullScreenForm>
            <FullScreenFormHeader
                steps={["Cuesheet"]}
                currentStep={0}
                onStepChange={() => { }}
                onClose={onClose}
            />

            <FullScreenFormBody>
                <div className="flex flex-col gap-8 w-full">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">Set up Worship Flow</h2>
                        <span className="text-muted-foreground font-normal text-sm">Organize service order</span>
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
                                                No templates found. We&apos;ve prepared a sample flow!
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
                </div>
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <div className="w-full flex justify-center pointer-events-none absolute bottom-32 left-0 right-0 z-10">
                    <AnimatePresence>
                        {hasTemplateChanges && selectedTemplateId && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="pointer-events-auto"
                            >
                                <button
                                    onClick={handleUpdateTemplate}
                                    className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-xl group active:scale-95 transition-all shadow-sm"
                                >
                                    <span className="text-[13px] font-bold text-primary">
                                        Save to &quot;{templates.find(t => t.id === selectedTemplateId)?.name}&quot;
                                    </span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Button
                    className="h-12 w-full rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : <>Save Flow <Check className="w-5 h-5 ml-1" /></>}
                </Button>
            </FullScreenFormFooter>

            {/* Member Selection Drawer */}
            <Drawer open={!!activeSelection} onOpenChange={(open) => {
                if (!open) {
                    setActiveSelection(null);
                    setMemberSearchQuery("");
                }
            }}>
                <DrawerContent className="h-[96vh] rounded-t-[2.5rem]">
                    <div className="mx-auto w-full max-w-lg h-full flex flex-col pt-2 relative">
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
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="flex flex-col gap-6 pb-32 pt-2 px-6">
                                <DrawerTitle className="text-xl font-bold text-foreground tracking-tight px-1">
                                    Select Member
                                </DrawerTitle>

                                <MemberSelector
                                    searchQuery={memberSearchQuery}
                                    selectedMemberIds={
                                        activeSelection?.itemId && activeSelection.assignmentIndex !== undefined
                                            ? items.find(i => i.id === activeSelection.itemId)?.assignments[activeSelection.assignmentIndex]?.memberIds || []
                                            : []
                                    }
                                    onSelect={(memberId) => {
                                        if (activeSelection?.itemId && activeSelection.assignmentIndex !== undefined) {
                                            handleAddMember(activeSelection.itemId, activeSelection.assignmentIndex, memberId);
                                        }
                                    }}
                                    multiple
                                    groups={standardGroups}
                                    onAddGroup={(name) => {
                                        setStandardGroups(prev => [...prev, name]);
                                        PraiseAssigneeService.addCustomGroup(teamId, name).catch(console.error);
                                    }}
                                    onRemoveGroup={(idx) => {
                                        setStandardGroups(standardGroups.filter((_, i) => i !== idx));
                                    }}
                                    customMemberNames={customMemberNames}
                                    onAddCustomMember={(name) => {
                                        setCustomMemberNames(prev => [...prev, name]);
                                        PraiseAssigneeService.addCustomMemberName(teamId, name).catch(console.error);
                                    }}
                                />
                            </div>
                        </ScrollArea>

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

            {/* Template Dialogs */}
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
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                onDeleteHandler={() => {
                    return handleDeleteTemplate();
                }}
            />
        </FullScreenForm>
    );
}
