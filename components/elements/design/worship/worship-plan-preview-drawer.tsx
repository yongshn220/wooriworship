import React, { useMemo } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { worshipAtom, worshipSongListAtom } from "@/global-states/worship-state";
import { WorshipSongListCard } from "@/app/board/[teamId]/(worship)/worship-board/_components/parts/worship-song-list-card";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    worshipId: string | null;
}

function PreviewContent({ worshipId }: { worshipId: string }) {
    const worship = useRecoilValue(worshipAtom(worshipId));
    const songsLoadable = useRecoilValueLoadable(worshipSongListAtom(worshipId));

    const songs = useMemo(() => {
        return songsLoadable.state === 'hasValue' ? songsLoadable.contents : [];
    }, [songsLoadable]);

    if (!worship) return null;

    return (
        <WorshipSongListCard
            songs={songs}
            teamId={worship.team_id}
        />
    );
}

export function WorshipPlanPreviewDrawer({ isOpen, onClose, worshipId }: Props) {
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh]">
                <DrawerHeader className="text-left border-b pb-4">
                    <DrawerTitle>Worship Songs Preview</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-y-auto no-scrollbar pb-10">
                    {worshipId && (
                        <PreviewContent worshipId={worshipId} />
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
