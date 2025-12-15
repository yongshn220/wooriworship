"use client";

import { useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Check, Shield, User } from "lucide-react";
import { auth } from "@/firebase";

import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { toast } from "@/components/ui/use-toast";

import { fetchServingRolesSelector, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { teamUpdaterAtom, teamAtom } from "@/global-states/teamState";
import { ServingService, TeamService } from "@/apis";
import { userAtom } from "@/global-states/userState";

interface Props {
    userId: string | null;
    teamId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MemberRoleDrawer({ userId, teamId, open, onOpenChange }: Props) {
    const user = useRecoilValue(userAtom(userId || ""));
    const team = useRecoilValue(teamAtom(teamId));
    const currentUser = useRecoilValue(userAtom(auth.currentUser?.uid || ""));
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    const setServingRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);
    const setTeamUpdater = useSetRecoilState(teamUpdaterAtom);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isAdmin = useMemo(() => {
        if (!userId || !team) return false;
        return team.admins?.includes(userId);
    }, [team, userId]);

    const isCurrentUserAdmin = useMemo(() => {
        if (!team || !auth.currentUser?.uid) return false;
        return team.admins?.includes(auth.currentUser.uid);
    }, [team]);

    if (!userId) return null;

    async function toggleAdmin() {
        if (!userId || !isCurrentUserAdmin) return;
        if (isAdmin) {
            await TeamService.removeAdmin(teamId, userId);
        } else {
            await TeamService.addAdmin(teamId, userId);
        }
        setTeamUpdater(prev => prev + 1);
    }

    async function toggleServingRole(roleId: string, currentDefaultMembers: string[] = []) {
        if (!userId || !isCurrentUserAdmin) return;
        const isAssigned = currentDefaultMembers.includes(userId);
        if (isAssigned) {
            await ServingService.removeDefaultMember(teamId, roleId, userId);
        } else {
            await ServingService.addDefaultMember(teamId, roleId, userId);
        }
        setServingRolesUpdater(prev => prev + 1);
    }

    async function handleRemoveMember() {
        if (!userId) return;
        try {
            const result = await TeamService.removeMember(userId, teamId, false);
            if (result === false) {
                toast({ title: "Failed to remove member", variant: "destructive" });
                return;
            }
            setTeamUpdater(prev => prev + 1);
            toast({ title: "Member removed successfully" });
            onOpenChange(false);
        } catch (e) {
            console.error(e);
            toast({ title: "Error removing member", variant: "destructive" });
        }
    }

    return (
        <ResponsiveDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Member Roles"
            description={`Manage roles and permissions for ${user?.name || "Member"}`}
            className="h-auto max-h-[85vh]"
        >
            <DeleteConfirmationDialog
                isOpen={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                title="Remove Team Member"
                description={`Are you sure you want to remove ${user?.name} from the team? This action cannot be undone.`}
                onDeleteHandler={handleRemoveMember}
            />

            <div className="flex flex-col gap-6 pb-6">

                {/* Permission Section */}
                <div className="space-y-3">
                    <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                        Team Permission
                    </Label>
                    <div
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all",
                            isAdmin ? "bg-primary/5 border-primary" : "bg-card"
                        )}
                    >
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-full shrink-0",
                            isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            {isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold">{isAdmin ? "Team Admin" : "Team Member"}</span>
                                {isAdmin && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isAdmin ? "Can manage team settings, members, and schedules." : "Basic access to view schedules and serve."}
                            </p>
                        </div>
                    </div>

                    {isCurrentUserAdmin && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={toggleAdmin}
                        >
                            {isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
                        </Button>
                    )}
                </div>

                <Separator />

                {/* Serving Roles Section */}
                <div className="space-y-3">
                    <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                        Default Serving Roles
                    </Label>
                    <div className="bg-card rounded-xl border shadow-sm divide-y overflow-hidden">
                        {roles.map((role) => {
                            const isSelected = role.default_members?.includes(userId);
                            return (
                                <div
                                    key={role.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 transition-colors",
                                        isCurrentUserAdmin ? "cursor-pointer hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => toggleServingRole(role.id, role.default_members)}
                                >
                                    <span className="font-medium text-sm">{role.name}</span>
                                    <div className={cn(
                                        "h-6 w-6 rounded border flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-transparent border-gray-300"
                                    )}>
                                        {isSelected && <Check className="h-4 w-4" />}
                                    </div>
                                </div>
                            );
                        })}
                        {roles.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground italic">
                                No serving roles defined.
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                        Assigning roles here puts them in the "Quick Select" list when creating schedules.
                    </p>
                </div>

                <Separator />

                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    Remove from Team
                </Button>

            </div>
        </ResponsiveDrawer>
    );
}
