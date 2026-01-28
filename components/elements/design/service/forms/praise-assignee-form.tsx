"use client"

import React from "react";
import { Check, Plus, X, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";

// Logic & Types
import { usePraiseAssigneeFormLogic } from "./hooks/use-praise-assignee-form-logic";
import { ServicePraiseAssignee } from "@/models/services/ServiceEvent";
import { slideVariants } from "@/components/constants/animations";
import { SortableList } from "@/components/common/list/sortable-list";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";

// Shared Components (Relative Paths updated for new location)
import { SortableRoleItem } from "../service-form/items/sortable-role-item";
import { AddActionButton } from "../service-form/service-components";
import { MemberSelector } from "../service-form/member-selector";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface Props {
    teamId: string;
    serviceId: string;
    initialAssignee?: ServicePraiseAssignee | null;
    onCompleted: () => void;
    onClose: () => void;
}

export function PraiseAssigneeForm({ teamId, serviceId, initialAssignee, onCompleted, onClose }: Props) {
    const {
        isLoading,
        roles,
        worshipRoles,

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
        handleSave
    } = usePraiseAssigneeFormLogic({ teamId, serviceId, initialAssignee, onCompleted });

    const [memberSearchQuery, setMemberSearchQuery] = React.useState("");

    return (
        <FullScreenForm>
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

                    <div className="flex flex-col gap-4">
                        <SortableList items={roles} onReorder={(newRoles) => {
                            // Update local roles state is handled by useServingRoles internally?
                            // Wait, useServingRoles exposes setRoles but doesn't auto-save reorder.
                            // We need to verify if setRoles updates locally.
                            // Yes, in useServingRoles: const [roles, setRoles] ...
                            // But we should call API to save order
                            // setRoles is exposed from hook.
                            // But the hook implementation of setRoles might likely be just local state setter.
                            PraiseTeamApi.updateRolesOrder(teamId, newRoles).catch(console.error);
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
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <Button
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
                                    searchQuery={memberSearchQuery}
                                    selectedMemberIds={
                                        activeSelection?.roleId
                                            ? worshipRoles.find(a => a.roleId === activeSelection.roleId)?.memberIds || []
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
            </Dialog>

            <DeleteConfirmationDialog
                isOpen={deleteConfirm.open}
                setOpen={(open: boolean) => setDeleteConfirm(prev => ({ ...prev, open }))}
                title="Delete Role"
                description="Are you sure you want to delete this role? This action cannot be undone."
                onDeleteHandler={() => {
                    if (deleteConfirm.id) return handleDeleteRole(deleteConfirm.id, () => { });
                    return Promise.resolve();
                }}
            />

        </FullScreenForm>
    );
}
