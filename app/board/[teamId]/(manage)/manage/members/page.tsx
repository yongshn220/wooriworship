"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { currentTeamIdAtom, teamAtom, teamUpdaterAtom } from "@/global-states/teamState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { auth } from "@/firebase";
import { ChevronLeft, ChevronRight, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MemberRoleDrawer } from "@/components/elements/manage/member-role-drawer";
import { usersAtom } from "@/global-states/userState";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { fetchServingRolesSelector } from "@/global-states/serviceRolesState";
import { ContentContainer } from "@/components/common/layout/content-container";

export default function MembersPage() {
    const router = useRouter();
    const currentTeamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(currentTeamId));
    const setTeamUpdater = useSetRecoilState(teamUpdaterAtom);
    const users = useRecoilValue(usersAtom(team?.users || []));

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const isAdminA = team?.admins?.includes(a.id);
            const isAdminB = team?.admins?.includes(b.id);
            if (isAdminA && !isAdminB) return -1;
            if (!isAdminA && isAdminB) return 1;
            return (a.name || "").localeCompare(b.name || "");
        });
    }, [users, team?.admins]);

    // Refresh State
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial load & Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Small delay to show spinner interaction, and allow Recoil selector to re-eval
        setTeamUpdater(prev => prev + 1);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Auto-refresh on mount
    // Removing auto-refresh to prevent infinite loop with TeamIdValidation unmounting/remounting
    // useEffect(() => {
    //     handleRefresh();
    // }, []);

    // Drawer State
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    return (
        <div className="flex flex-col w-full h-full bg-background min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background px-4 h-14 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold flex-1">Manage Members</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <ContentContainer className="space-y-6">

                <div className="space-y-2">
                    <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                        Active Members ({team?.users?.length || 0})
                    </Label>
                    <div className="bg-card rounded-xl border shadow-sm divide-y">
                        {sortedUsers?.map((user) => (
                            <MemberItem
                                key={user.id}
                                user={user}
                                teamId={currentTeamId}
                                onClick={() => setSelectedMemberId(user.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                        Tap on a member to manage their roles, permissions, or remove them from the team.
                    </p>
                </div>
                </ContentContainer>
            </div>

            {/* Drawer */}
            <MemberRoleDrawer
                userId={selectedMemberId}
                teamId={currentTeamId}
                open={!!selectedMemberId}
                onOpenChange={(open) => !open && setSelectedMemberId(null)}
            />
        </div>
    );
}

function MemberItem({ user, teamId, onClick }: { user: any, teamId: string, onClick: () => void }) {
    const team = useRecoilValue(teamAtom(teamId));
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    const isAdmin = team?.admins?.includes(user?.id);
    const assignedRoleNames = roles
        .filter(r => r.default_members?.includes(user?.id))
        .map(r => r.name);

    return (
        <div
            className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {/* Placeholder or Avatar */}
                    <User className="w-5 h-5 opacity-70 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                            {user?.name || "No Name"}
                        </p>
                        {isAdmin && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">Admin</Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                    </p>
                    {assignedRoleNames.length > 0 && (
                        <p className="text-xs text-primary mt-0.5 truncate">
                            {assignedRoleNames.join(", ")}
                        </p>
                    )}
                </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </div>
    );
}
