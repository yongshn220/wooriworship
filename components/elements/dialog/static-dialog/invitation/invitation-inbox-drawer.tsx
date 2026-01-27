"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/firebase";
import { Invitation } from "@/models/invitation";
import { InvitationService } from "@/apis";
import { InvitationCard } from "@/components/elements/dialog/static-dialog/invitation/invitation-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function InvitationInboxDrawer({ isOpen, setIsOpen }: Props) {
    const authUser = auth.currentUser;
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInvitations = React.useCallback(async () => {
        if (!authUser?.email) return;

        setIsLoading(true);
        try {
            const data = await InvitationService.getPendingReceivedInvitations(authUser.email);
            setInvitations(data as Invitation[]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [authUser?.email]);

    useEffect(() => {
        if (isOpen) {
            fetchInvitations();
        }
    }, [isOpen, fetchInvitations]);

    return (
        <ResponsiveDrawer
            open={isOpen}
            onOpenChange={setIsOpen}
            title="Team Invitations"
            description="You are invited to the following teams. Join now!"
            className="h-[70vh]"
        >
            <div className="flex flex-col gap-4 pb-6 pt-2 h-full">

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 gap-2 text-muted-foreground"
                        onClick={fetchInvitations}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>

                {/* Content */}
                {invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed bg-muted/20">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No pending invitations</p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                            When someone invites you to their team, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto px-1">
                        {invitations.map((invitation: Invitation) => (
                            <Suspense key={invitation.id} fallback={<div className="h-24 bg-muted animate-pulse rounded-xl" />}>
                                <InvitationCard
                                    invitation={invitation}
                                    onResolve={(id) => setInvitations(prev => prev.filter((i) => i.id !== id))}
                                />
                            </Suspense>
                        ))}
                    </div>
                )}
            </div>
        </ResponsiveDrawer>
    );
}
