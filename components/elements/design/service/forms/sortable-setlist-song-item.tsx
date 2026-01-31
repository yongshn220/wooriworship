import React from "react";
import { SortableItem, SortableDragHandle } from "@/components/common/list/sortable-list";
import { AddedSongHeaderDefault } from "@/components/elements/design/song/song-header/setlist-form/added-song-header-default";
import { SetlistSongHeader } from "@/models/setlist";

interface SortableSetlistSongItemProps {
    item: SetlistSongHeader;
    teamId: string;
    index: number;
    onUpdate: (updatedItem: SetlistSongHeader) => void;
    onRemove: () => void;
}

export function SortableSetlistSongItem({ item, teamId, index, onUpdate, onRemove }: SortableSetlistSongItemProps) {
    return (
        <SortableItem value={item} className="z-0 select-none">
            {(controls) => (
                <div className="flex-1 min-w-0">
                    <AddedSongHeaderDefault
                        teamId={teamId}
                        songOrder={index + 1}
                        songHeader={item}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        dragHandle={<SortableDragHandle controls={controls} />}
                    />
                </div>
            )}
        </SortableItem>
    );
}
