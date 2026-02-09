
"use client"

import React from "react";
import { LinkIcon, Check } from "lucide-react";

// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter, FormSectionCard } from "@/components/common/form/full-screen-form";
import { SetlistSpecialOrderType } from "@/components/constants/enums";

// Custom Components
import { AddedSongHeaderStatic } from "@/components/elements/design/song/song-header/setlist-form/added-song-header-static";
import { AddSongButton } from "./add-song-button";
import { AddSetlistSongDialogTrigger } from "@/components/elements/design/song/song-list/setlist-form/add-setlist-song-dialog-trigger";
import { SortableSetlistSongItem } from "./sortable-setlist-song-item";
import { SortableList } from "@/components/common/list/sortable-list";

// Logic Hook
import { useSetlistFormLogic } from "./hooks/use-setlist-form-logic";
import { ServiceSetlist } from "@/models/services/ServiceEvent";
import { Timestamp } from "firebase/firestore";

interface Props {
    teamId: string;
    serviceId: string;
    initialSetlist?: ServiceSetlist | null;
    serviceDate?: Timestamp;
    onCompleted: () => void;
    onClose: () => void;
}

export function SetlistForm({ teamId, serviceId, initialSetlist, serviceDate, onCompleted, onClose }: Props) {

    const {
        // State
        basicInfo, setBasicInfo,
        songs, setSongs,
        beginningSong, setBeginningSong,
        endingSong, setEndingSong,
        isLoading,

        // Actions
        handleSave,
    } = useSetlistFormLogic({ teamId, serviceId, initialSetlist, serviceDate, onCompleted });

    return (
        <FullScreenForm data-testid="setlist-form">
            <FullScreenFormHeader
                steps={["Setlist"]}
                currentStep={0}
                onStepChange={() => {}}
                onClose={onClose}
            />

            <FullScreenFormBody>
                <div className="flex flex-col gap-6 w-full">

                    {/* Header */}
                    <div className="flex items-end justify-between px-2">
                        <h2 className="text-2xl font-bold text-foreground leading-none">Setlist</h2>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                            {songs.length} Songs
                        </span>
                    </div>

                    {/* Context Card */}
                    <FormSectionCard>
                        <Textarea
                            placeholder="Write a note for the team..."
                            value={basicInfo.description}
                            onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                            className="min-h-[80px] text-base bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 resize-none leading-relaxed"
                        />
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Paste a link (YouTube, etc.)"
                                value={basicInfo.link}
                                onChange={(e) => setBasicInfo(prev => ({ ...prev, link: e.target.value }))}
                                className="h-auto border-none shadow-none focus-visible:ring-0 p-0 bg-transparent text-sm"
                            />
                        </div>
                    </FormSectionCard>

                    {/* Song List */}
                    <div className="flex flex-col space-y-4">

                        {/* Beginning Song */}
                        {beginningSong?.id && (
                            <AddedSongHeaderStatic
                                teamId={teamId}
                                specialOrderType={SetlistSpecialOrderType.BEGINNING}
                                songHeader={beginningSong}
                                onUpdate={(updated) => setBeginningSong(updated)}
                                onRemove={() => setBeginningSong(null)}
                            />
                        )}

                        {/* Reorderable List */}
                        <SortableList items={songs} onReorder={setSongs}>
                            {songs.map((songHeader, i) => (
                                <SortableSetlistSongItem
                                    key={`${songHeader.id}-${i}`}
                                    item={songHeader}
                                    teamId={teamId}
                                    index={i}
                                    onUpdate={(updated) => setSongs(prev => prev.map((s, idx) => idx === i ? updated : s))}
                                    onRemove={() => setSongs(prev => prev.filter((_, idx) => idx !== i))}
                                />
                            ))}
                        </SortableList>

                        {/* Ending Song */}
                        {endingSong?.id && (
                            <AddedSongHeaderStatic
                                teamId={teamId}
                                specialOrderType={SetlistSpecialOrderType.ENDING}
                                songHeader={endingSong}
                                onUpdate={(updated) => setEndingSong(updated)}
                                onRemove={() => setEndingSong(null)}
                            />
                        )}

                        <div className="pt-2">
                            <AddSetlistSongDialogTrigger
                                teamId={teamId}
                                selectedSongs={songs}
                                onUpdateList={setSongs}
                            >
                                <AddSongButton />
                            </AddSetlistSongDialogTrigger>
                        </div>
                    </div>

                </div>
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <Button
                    data-testid="form-submit"
                    className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground/50 disabled:opacity-100 disabled:shadow-none"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : <>Save Setlist <Check className="w-5 h-5 ml-1" /></>}
                </Button>
            </FullScreenFormFooter>
        </FullScreenForm>
    )
}
