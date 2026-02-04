"use client"

import React from "react";
import { Check, Plus, Trash2, EllipsisVertical, Pencil, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { SearchBar } from "@/components/common/search-bar";
import { DrawerFloatingFooter, DrawerDoneButton } from "@/components/common/drawer-floating-footer";

// Logic & Types
import { usePraiseAssigneeFormLogic } from "./hooks/use-praise-assignee-form-logic";
import { ServicePraiseTeam } from "@/models/services/ServiceEvent";
import { Timestamp } from "firebase/firestore";
import { slideVariants } from "@/components/constants/animations";
import { SortableList } from "@/components/common/list/sortable-list";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";

// Shared Components (Relative Paths updated for new location)
import { SortableRoleItem } from "./items/sortable-role-item";
import { AddActionButton } from "./service-components";
import { MemberSelector } from "./member-selector";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface Props {
    teamId: string;
    serviceId: string;
    initialAssignee?: ServicePraiseTeam | null;
    serviceDate?: Timestamp;
    onCompleted: () => void;
    onClose: () => void;
}

export function PraiseAssigneeForm({ teamId, serviceId, initialAssignee, serviceDate, onCompleted, onClose }: Props) {
    const {
        isLoading,
        roles,
        praiseTeam,
        setPraiseTeam,

        // UI State
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        newRoleName,
        setNewRoleName,
        isCreatingRole,
        deleteConfirm,
        setDeleteConfirm,
        activeSelection,
        setActiveSelection,
        standardGroups,
        setStandardGroups,
        customMemberNames,
        setCustomMemberNames,
        team,
        teamMembers,

        // Actions
        handleCreateRole,
        handleDeleteRole,
        handleAssignMemberToRole,
        handleSave,

        // Praise Team Templates
        ptTemplates,
        isPtTemplatesLoaded,
        selectedPtTemplateId,
        setSelectedPtTemplateId,
        hasPtTemplateChanges,
        isPtTemplateDialogOpen,
        setIsPtTemplateDialogOpen,
        isPtRenameDialogOpen,
        setIsPtRenameDialogOpen,
        newPtTemplateName,
        setNewPtTemplateName,
        tempPtTemplateName,
        setTempPtTemplateName,
        handleSavePtTemplate,
        handleUpdatePtTemplate,
        handleDeletePtTemplate,
        handleUpdatePtTemplateName,
    } = usePraiseAssigneeFormLogic({ teamId, serviceId, initialAssignee, serviceDate, onCompleted });

    const [memberSearchQuery, setMemberSearchQuery] = React.useState("");
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);

    return (
        <FullScreenForm data-testid="praise-assignee-form">
            <FullScreenFormHeader
                steps={["Assignments"]}
                currentStep={0}
                onStepChange={() => { }} // Single step
                onClose={onClose}
            />

            <FullScreenFormBody>
                <div className="flex flex-col gap-8 w-full">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">Assign Roles</h2>
                        <span className="text-muted-foreground font-normal text-sm">Organize your praise team</span>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Praise Team Template Header & Actions */}
                        {isPtTemplatesLoaded && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-5 px-5">
                                    {ptTemplates.map(tmp => (
                                        <button
                                            key={tmp.id}
                                            onClick={() => {
                                                setSelectedPtTemplateId(tmp.id);
                                                setPraiseTeam(tmp.assignments || []);
                                            }}
                                            className={cn(
                                                "flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95",
                                                selectedPtTemplateId === tmp.id
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
                                            setNewPtTemplateName("");
                                            setIsPtTemplateDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add
                                    </button>
                                </div>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted transition-colors outline-none flex-shrink-0">
                                            <EllipsisVertical className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" sideOffset={4} className="min-w-[200px] rounded-xl p-1 bg-popover/95 backdrop-blur-xl shadow-lg border border-border/50">
                                        <DropdownMenuItem
                                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-pointer"
                                            disabled={!selectedPtTemplateId}
                                            onSelect={() => {
                                                const currentTemp = ptTemplates.find(t => t.id === selectedPtTemplateId);
                                                setTempPtTemplateName(currentTemp?.name || "");
                                                setIsPtRenameDialogOpen(true);
                                            }}
                                        >
                                            Rename Template
                                            <Pencil className="w-4 h-4 text-muted-foreground" />
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="mx-1" />
                                        <DropdownMenuItem
                                            className={cn("flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-pointer", hasPtTemplateChanges ? "text-primary" : "text-muted-foreground")}
                                            disabled={!selectedPtTemplateId || !hasPtTemplateChanges}
                                            onSelect={() => {
                                                handleUpdatePtTemplate();
                                            }}
                                        >
                                            Save to &quot;{ptTemplates.find(t => t.id === selectedPtTemplateId)?.name}&quot;
                                            <Save className="w-4 h-4 text-muted-foreground" />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-pointer"
                                            onSelect={() => {
                                                const currentTemp = ptTemplates.find(t => t.id === selectedPtTemplateId);
                                                setNewPtTemplateName(`${currentTemp?.name || "Template"} copy`);
                                                setIsPtTemplateDialogOpen(true);
                                            }}
                                        >
                                            Save as New
                                            <Plus className="w-4 h-4 text-muted-foreground" />
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="mx-1" />
                                        <DropdownMenuItem
                                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                                            onSelect={() => {
                                                setDeleteConfirm({ type: 'pt-template', id: selectedPtTemplateId || '', open: true });
                                            }}
                                        >
                                            Delete Template
                                            <Trash2 className="w-4 h-4" />
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        {/* Role List */}
                        <div className="flex flex-col gap-4">
                            <SortableList items={roles} onReorder={(newRoles) => {
                                PraiseTeamApi.updateRolesOrder(teamId, newRoles).catch(console.error);
                            }}>
                                {roles.map((role) => {
                                    const assignment = praiseTeam.find(a => a.roleId === role.id);
                                    const memberIds = assignment?.memberIds || [];

                                    return (
                                        <SortableRoleItem
                                            key={role.id}
                                            role={role}
                                            memberIds={memberIds}
                                            teamMembers={teamMembers}
                                            onAddMember={handleAssignMemberToRole}
                                            onDeleteRole={() => setDeleteConfirm({ type: 'role', id: role.id, open: true })}
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
                    </div>
                </div>
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <div className="w-full flex justify-center pointer-events-none absolute bottom-32 left-0 right-0 z-10">
                    <AnimatePresence>
                        {hasPtTemplateChanges && selectedPtTemplateId && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="pointer-events-auto"
                            >
                                <button
                                    onClick={handleUpdatePtTemplate}
                                    className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-xl group active:scale-95 transition-all shadow-sm"
                                >
                                    <span className="text-[13px] font-bold text-primary">
                                        Save to &quot;{ptTemplates.find(t => t.id === selectedPtTemplateId)?.name}&quot;
                                    </span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Button
                    data-testid="form-submit"
                    className="h-12 w-full rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : <>Save Assignments <Check className="w-5 h-5 ml-1" /></>}
                </Button>
            </FullScreenFormFooter>

            {/* Sub-Components (Drawers/Dialogs) */}

            {/* Member Selection Drawer */}
            <Drawer open={!!activeSelection} onOpenChange={(open) => {
                if (!open) {
                    setActiveSelection(null);
                    setMemberSearchQuery("");
                    setIsSearchFocused(false);
                }
            }}>
                <DrawerContent className="h-[90vh] rounded-t-[2.5rem]">
                    <DrawerTitle className="sr-only">Select Member</DrawerTitle>
                    <DrawerDescription className="sr-only">
                        Select a member to assign to this role.
                    </DrawerDescription>
                    <div className="mx-auto w-full max-w-lg h-full flex flex-col pt-2 relative">
                        {/* Header with Search Bar */}
                        <div className="flex flex-col gap-1 px-6 pt-4 pb-2">
                            <SearchBar
                                value={memberSearchQuery}
                                onChange={setMemberSearchQuery}
                                placeholder="Search members..."
                                size="lg"
                                inputClassName="rounded-2xl"
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>

                        {/* Unified Scroll Area */}
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col pb-32 pt-2 px-6">
                                <MemberSelector
                                    searchQuery={memberSearchQuery}
                                    selectedMemberIds={
                                        activeSelection?.roleId
                                            ? praiseTeam.find(a => a.roleId === activeSelection.roleId)?.memberIds || []
                                            : []
                                    }
                                    onSelect={(memberId) => {
                                        if (activeSelection?.roleId) {
                                            handleAssignMemberToRole(activeSelection.roleId, memberId);
                                        }
                                    }}
                                    multiple
                                    groups={standardGroups}
                                    onAddGroup={(name) => {
                                        setStandardGroups(prev => [...prev, name]);
                                        PraiseTeamApi.addCustomGroup(teamId, name).catch(console.error);
                                    }}
                                    onRemoveGroup={(idx) => {
                                        setStandardGroups(standardGroups.filter((_, i) => i !== idx));
                                    }}
                                    customMemberNames={customMemberNames}
                                    onAddCustomMember={(name) => {
                                        setCustomMemberNames(prev => [...prev, name]);
                                        PraiseTeamApi.addCustomMemberName(teamId, name).catch(console.error);
                                    }}
                                />
                            </div>
                        </ScrollArea>

                        <DrawerFloatingFooter hidden={isSearchFocused}>
                            <DrawerDoneButton onClick={() => setActiveSelection(null)} />
                        </DrawerFloatingFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Role Creation Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-0 shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
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
            </Dialog>

            <DeleteConfirmationDialog
                isOpen={deleteConfirm.open}
                setOpen={(open: boolean) => setDeleteConfirm(prev => ({ ...prev, open }))}
                title={deleteConfirm.type === 'pt-template' ? "Delete Template" : "Delete Role"}
                description={deleteConfirm.type === 'pt-template'
                    ? "Are you sure you want to delete this template? This action cannot be undone."
                    : "Are you sure you want to delete this role? This action cannot be undone."
                }
                onDeleteHandler={() => {
                    if (deleteConfirm.type === 'pt-template') {
                        return handleDeletePtTemplate();
                    }
                    if (deleteConfirm.id) return handleDeleteRole(deleteConfirm.id, () => { });
                    return Promise.resolve();
                }}
            />

            {/* Praise Team Template Save Dialog */}
            <Dialog open={isPtTemplateDialogOpen} onOpenChange={setIsPtTemplateDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-0 shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Save className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">
                            Save Template
                        </DialogTitle>
                        <p className="text-sm text-center text-muted-foreground font-medium leading-relaxed">
                            Save this team lineup as a template to reuse it for future services.
                        </p>
                    </DialogHeader>
                    <div className="py-6">
                        <Input
                            placeholder="e.g. Sunday Morning Team"
                            value={newPtTemplateName}
                            onChange={(e) => setNewPtTemplateName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.nativeEvent.isComposing) return;
                                if (e.key === "Enter" && newPtTemplateName.trim()) {
                                    handleSavePtTemplate();
                                }
                            }}
                            className="h-14 rounded-2xl border-border bg-secondary/30 px-5 text-lg font-medium shadow-inner focus:bg-background transition-all ring-offset-0 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <DialogFooter className="flex sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            className="h-12 flex-1 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-secondary"
                            onClick={() => setIsPtTemplateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-12 flex-1 rounded-2xl font-bold shadow-lg"
                            onClick={handleSavePtTemplate}
                            disabled={!newPtTemplateName.trim()}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Praise Team Template Rename Dialog */}
            <Dialog open={isPtRenameDialogOpen} onOpenChange={setIsPtRenameDialogOpen}>
                <DialogContent className="max-w-[calc(100%-40px)] w-[400px] rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 text-left">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Rename Template</DialogTitle>
                    </DialogHeader>
                    <div className="px-8 pb-8 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[13px] font-bold text-primary uppercase tracking-wider ml-1">NEW NAME</Label>
                            <Input
                                value={tempPtTemplateName}
                                onChange={(e) => setTempPtTemplateName(e.target.value)}
                                placeholder="Enter template name..."
                                className="h-14 px-5 rounded-2xl bg-secondary/50 border-border focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl border-border text-muted-foreground font-bold hover:bg-secondary transition-all"
                                onClick={() => setIsPtRenameDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg shadow-muted active:scale-[0.98] transition-all"
                                onClick={() => {
                                    handleUpdatePtTemplateName(tempPtTemplateName);
                                    setIsPtRenameDialogOpen(false);
                                }}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </FullScreenForm>
    );
}
