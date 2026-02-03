import React, { useMemo } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { setlistAtom, setlistSongListAtom } from "@/global-states/setlist-state";
import { SetlistSongListCard } from "@/components/elements/design/setlist/parts/setlist-song-list-card";

interface Props {
    teamId: string;
    isOpen: boolean;
    onClose: () => void;
    setlistId: string | null;
}

function PreviewContent({ teamId, setlistId }: { teamId: string, setlistId: string }) {
    const setlist = useRecoilValue(setlistAtom({ teamId, setlistId }));
    const songsLoadable = useRecoilValueLoadable(setlistSongListAtom({ teamId, setlistId }));

    const songs = useMemo(() => {
        const rawSongs = songsLoadable.state === 'hasValue' ? songsLoadable.contents : [];
        // Map to SetlistSongItem format
        return rawSongs.map(song => ({
            id: song?.id || "",
            title: song?.title || "",
            key: song?.keys?.[0] || "",
            keyNote: "" // Legacy setlist doesn't have keyNote
        }));
    }, [songsLoadable]);

    if (!setlist) return null;

    return (
        <SetlistSongListCard
            songs={songs}
            teamId={setlist.team_id}
        />
    );
}

export function SetlistPlanPreviewDrawer({ teamId, isOpen, onClose, setlistId }: Props) {
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh]">
                <DrawerHeader className="text-left border-b pb-4">
                    <DrawerTitle>Setlist Songs Preview</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-y-auto no-scrollbar pb-10">
                    {setlistId && (
                        <PreviewContent teamId={teamId} setlistId={setlistId} />
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
