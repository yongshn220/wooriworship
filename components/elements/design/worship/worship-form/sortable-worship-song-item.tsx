import React from "react";
import { SortableItem, SortableDragHandle } from "@/components/common/list/sortable-list";
import { AddedSongHeaderDefault } from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import { WorshipSongHeader } from "@/models/worship";

interface SortableWorshipSongItemProps {
    item: WorshipSongHeader;
    teamId: string;
    index: number;
    onUpdate: (updatedItem: WorshipSongHeader) => void;
    onRemove: () => void;
}

export function SortableWorshipSongItem({ item, teamId, index, onUpdate, onRemove }: SortableWorshipSongItemProps) {
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
