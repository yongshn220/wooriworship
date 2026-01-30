
"use client"

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LinkIcon, ArrowRight, ChevronLeft, Check } from "lucide-react";

// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter, FormSectionCard } from "@/components/common/form/full-screen-form";
import { WorshipSpecialOrderType } from "@/components/constants/enums";

// Custom Components
import { AddedSongHeaderStatic } from "@/components/elements/design/song/song-header/setlist-form/added-song-header-static";
import { AddSongButton } from "@/components/elements/design/setlist/setlist-form/add-song-button";
import { AddSetlistSongDialogTrigger } from "@/components/elements/design/song/song-list/setlist-form/add-setlist-song-dialog-trigger";
import { SortableSetlistSongItem } from "@/components/elements/design/setlist/setlist-form/sortable-setlist-song-item";
import { SortableList } from "@/components/common/list/sortable-list";

// Logic Hook
import { useSetlistFormLogic } from "./hooks/use-setlist-form-logic";
import { slideVariants } from "@/components/constants/animations";
import { ServiceSetlist } from "@/models/services/ServiceEvent";

interface Props {
    teamId: string;
    serviceId: string;
    initialSetlist?: ServiceSetlist | null;
    onCompleted: () => void;
    onClose: () => void;
}

export function SetlistForm({ teamId, serviceId, initialSetlist, onCompleted, onClose }: Props) {

    const {
        // State
        step, direction, totalSteps,
        basicInfo, setBasicInfo,
        songs, setSongs,
        beginningSong, setBeginningSong,
        endingSong, setEndingSong,
        isLoading,

        // Actions
        handleSave,
        goToStep, nextStep, prevStep
    } = useSetlistFormLogic({ teamId, serviceId, initialSetlist, onCompleted });

    // Scroll Reset Logic
    const bodyRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [step]);

    return (
        <FullScreenForm data-testid="setlist-form">
            <FullScreenFormHeader
                steps={["Context", "Setlist"]}
                currentStep={step}
                onStepChange={goToStep}
                onClose={onClose}
            />

            <FullScreenFormBody ref={bodyRef}>
                <AnimatePresence initial={false} custom={direction}>

                    {/* Step 1: Context */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex flex-col gap-8 w-full"
                        >
                            <div className="space-y-2 text-center">
                                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 1</Label>
                                <div className="flex items-baseline justify-center gap-2">
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Add Context</h2>
                                    <span className="text-muted-foreground font-normal text-sm lowercase">(optional)</span>
                                </div>
                            </div>

                            {/* Card */}
                            <FormSectionCard>
                                <Textarea
                                    placeholder="Write a description or note for the team..."
                                    value={basicInfo.description}
                                    onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                                    className="min-h-[150px] text-lg bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 resize-none leading-relaxed"
                                />
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Add a external link (e.g. YouTube)..."
                                        value={basicInfo.link}
                                        onChange={(e) => setBasicInfo(prev => ({ ...prev, link: e.target.value }))}
                                        className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-base"
                                    />
                                </div>
                            </FormSectionCard>
                        </motion.div>
                    )}

                    {/* Step 2: Setlist */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex flex-col gap-8 w-full"
                        >
                            <div className="flex items-end justify-between px-2 pb-1">
                                <div>
                                    <Label className="text-xs font-bold text-primary uppercase tracking-wider">Final Step</Label>
                                    <h2 className="text-2xl font-bold text-foreground leading-none">Setlist</h2>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 mb-1">
                                    {songs.length} Songs
                                </span>
                            </div>

                            {/* Flat List (No Card Wrapper) */}
                            <div className="flex flex-col space-y-4">

                                {/* Beginning Song */}
                                {beginningSong?.id && (
                                    <AddedSongHeaderStatic
                                        teamId={teamId}
                                        specialOrderType={WorshipSpecialOrderType.BEGINNING}
                                        songHeader={beginningSong}
                                        onUpdate={(updated) => setBeginningSong(updated)}
                                        onRemove={() => setBeginningSong(null)}
                                    />
                                )}

                                {/* Reorderable List */}
                                <SortableList items={songs} onReorder={setSongs}>
                                    {songs.map((songHeader, i) => (
                                        <SortableSetlistSongItem
                                            key={songHeader.id || i}
                                            item={songHeader}
                                            teamId={teamId}
                                            index={i}
                                            onUpdate={(updated) => setSongs(prev => prev.map(s => s.id === updated.id ? updated : s))}
                                            onRemove={() => setSongs(prev => prev.filter(s => s.id !== songHeader.id))}
                                        />
                                    ))}
                                </SortableList>

                                {/* Ending Song */}
                                {endingSong?.id && (
                                    <AddedSongHeaderStatic
                                        teamId={teamId}
                                        specialOrderType={WorshipSpecialOrderType.ENDING}
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
                        </motion.div>
                    )}

                </AnimatePresence>
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <div className="w-12 h-12 flex-none">
                    <Button
                        variant="outline"
                        className="h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground shadow-sm disabled:opacity-0 disabled:pointer-events-none transition-opacity duration-300"
                        onClick={prevStep}
                        disabled={step === 0}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </div>
                <Button
                    data-testid="form-submit"
                    className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground/50 disabled:opacity-100 disabled:shadow-none"
                    onClick={step === totalSteps - 1 ? handleSave : nextStep}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        "Saving..."
                    ) : step === totalSteps - 1 ? (
                        <>Save Setlist <Check className="w-5 h-5 ml-1" /></>
                    ) : (
                        <>
                            {step === 0 && !basicInfo.description && !basicInfo.link ? "Skip" : "Next"}
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </>
                    )}
                </Button>
            </FullScreenFormFooter>
        </FullScreenForm>
    )
}
