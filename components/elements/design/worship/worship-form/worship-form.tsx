"use client"

import React from "react";
import { FormMode, WorshipSpecialOrderType } from "@/components/constants/enums";
import { Worship } from "@/models/worship";
import { format } from 'date-fns';
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { LinkIcon, ArrowRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter, FormSectionCard } from "@/components/common/form/full-screen-form";
import { LinkedResourceCard } from "@/components/common/form/linked-resource-card";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { formatToLongDate } from "@/components/util/helper/helper-functions";

// Custom Components
import { AddedSongHeaderStatic } from "@/components/elements/design/song/song-header/worship-form/added-song-header-static";
import { AddSongButton } from "@/components/elements/design/worship/worship-form/add-song-button";
import { AddWorshipSongDialogTrigger } from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog-trigger";
import { SortableWorshipSongItem } from "./sortable-worship-song-item";
import { AddedSongHeaderDefault } from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import { SortableList } from "@/components/common/list/sortable-list";

// Logic Hook
import { useWorshipFormLogic } from "./hooks/use-worship-form-logic";
import { slideVariants } from "@/components/constants/animations";

interface Props {
  mode: FormMode
  teamId: string
  worship: Worship
}

export function WorshipForm({ mode, teamId, worship }: Props) {
  const router = useRouter()

  const {
    // State
    step, direction, totalSteps,
    basicInfo, setBasicInfo,
    serviceTagIds, setServiceTagIds,
    date, setDate,
    songs, setSongs,
    beginningSong, setBeginningSong,
    endingSong, setEndingSong,
    availableServingSchedules, linkedServingId, setLinkedServingId,
    isLoading,
    isDuplicate, duplicateId, duplicateErrorMessage,

    // Actions
    handleCreate, handleEdit,
    goToStep, nextStep, prevStep
  } = useWorshipFormLogic({ mode, teamId, initialWorship: worship });


  return (
    <FullScreenForm>
      <FullScreenFormHeader
        steps={["Date & Service", "Context", "Setlist"]}
        currentStep={step}
        onStepChange={isDuplicate ? undefined : goToStep}
        onClose={() => router.back()}
      />

      <FullScreenFormBody>
        <AnimatePresence initial={false} custom={direction}>

          {/* Step 1: Date & Service */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col gap-6 w-full"
            >
              <div className="space-y-2 text-center">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 1</Label>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Select Date & Service</h2>
              </div>

              {isDuplicate && duplicateId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-2xl bg-orange-50/80 border border-orange-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <h3 className="text-sm font-bold text-orange-900 truncate">Plan already exists.</h3>
                      <p className="text-xs text-orange-800/80 truncate">
                        <span className="mr-1">{format(date, "yyyy-MM-dd")}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-xs shadow-sm flex-shrink-0"
                    onClick={() => router.replace(`/board/${teamId}/edit-worship/${duplicateId}`)}
                  >
                    Edit <ArrowRight className="ml-1 w-3 h-3" />
                  </Button>
                </motion.div>
              )}

              {/* Main Input Card */}
              <ServiceDateSelector
                teamId={teamId}
                serviceTagIds={serviceTagIds}
                onServiceTagIdsChange={setServiceTagIds}
                date={date}
                onDateChange={(d) => d && setDate(d)}
              />

              {/* Linked Serving Schedule */}
              <LinkedResourceCard
                label="Linked Serving Schedule"
                items={availableServingSchedules.map(sch => ({
                  id: sch.id,
                  title: sch.title || "Untitled Service",
                  description: formatToLongDate(sch.date)
                }))}
                selectedId={linkedServingId}
                onSelect={setLinkedServingId}
              />
            </motion.div>
          )}

          {/* Step 2: Context */}
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
              <div className="space-y-2 text-center">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 2</Label>
                <div className="flex items-baseline justify-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Add Context</h2>
                  <span className="text-muted-foreground font-normal text-sm lowercase">(optional)</span>
                </div>
              </div>

              {/* Card */}
              <FormSectionCard>
                <Textarea
                  placeholder="Add sermon topic, announcements, or any notes..."
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[150px] text-lg bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-gray-300 resize-none leading-relaxed"
                />
                <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Add a link..."
                    value={basicInfo.link}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, link: e.target.value }))}
                    className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-base"
                  />
                </div>
              </FormSectionCard>
            </motion.div>
          )}

          {/* Step 3: Setlist */}
          {step === 2 && (
            <motion.div
              key="step2"
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
                    <SortableWorshipSongItem
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

                <div className="pt-2 flex justify-center">
                  <AddWorshipSongDialogTrigger
                    teamId={teamId}
                    selectedSongs={songs}
                    onUpdateList={setSongs}
                  >
                    <AddSongButton />
                  </AddWorshipSongDialogTrigger>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </FullScreenFormBody>

      <FullScreenFormFooter
        errorMessage={isDuplicate ? undefined : duplicateErrorMessage}
      >
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
          className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100 disabled:shadow-none"
          onClick={step === totalSteps - 1 ? (mode === FormMode.CREATE ? handleCreate : handleEdit) : nextStep}
          disabled={isLoading || (step === 0 && (serviceTagIds.length === 0 || isDuplicate))}
        >
          {isLoading ? (
            "Saving..."
          ) : step === totalSteps - 1 ? (
            <>Create Plan <Check className="w-5 h-5 ml-1" /></>
          ) : (
            <>
              {step === 1 && !basicInfo.description && !basicInfo.link ? "Skip" : "Next"}
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </FullScreenFormFooter>
    </FullScreenForm>
  )
}
