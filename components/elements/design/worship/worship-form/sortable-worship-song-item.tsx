import React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { AddedSongHeaderDefault } from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import { WorshipSongHeader } from "@/models/worship";
import { cn } from "@/lib/utils";

interface SortableWorshipSongItemProps {
    item: WorshipSongHeader;
    teamId: string;
    index: number;
    onUpdate: (updatedItem: WorshipSongHeader) => void;
    onRemove: () => void;
}

export function SortableWorshipSongItem({ item, teamId, index, onUpdate, onRemove }: SortableWorshipSongItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item value={item} dragListener={false} dragControls={controls} className="relative z-0 select-none">
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <div
                    className="mt-6 p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors touch-none"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <AddedSongHeaderDefault
                        teamId={teamId}
                        songOrder={index + 1}
                        songHeader={item}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                    />
                </div>
            </div>
        </Reorder.Item>
    );
}
