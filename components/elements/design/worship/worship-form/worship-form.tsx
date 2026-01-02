import { auth } from "@/firebase";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { worshipIdsUpdaterAtom, worshipUpdaterAtom } from "@/global-states/worship-state";
import { teamAtom } from "@/global-states/teamState";
import React, { useCallback, useEffect, useState } from "react";
import { FormMode, WorshipSpecialOrderType } from "@/components/constants/enums";
import { timestampToDate } from "@/components/util/helper/helper-functions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { WorshipService } from "@/apis";
import { getPathPlan } from "@/components/util/helper/routes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Worship } from "@/models/worship";
import { format, nextFriday, nextSunday } from 'date-fns';
import {
  selectedWorshipSongHeaderListAtom,
  worshipBeginningSongHeaderAtom,
  worshipEndingSongHeaderAtom
} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import { WorshipDatePicker } from "@/components/elements/design/worship/worship-form/worship-date-picker";
import {
  AddedSongHeaderStatic
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-static";
import {
  AddedSongHeaderDefault
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import { AddSongButton } from "@/components/elements/design/worship/worship-form/add-song-button";
import {
  AddWorshipSongDialogTrigger
} from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog-trigger";
import { LinkIcon, CalendarIcon, Music, ArrowRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import PushNotificationService from "@/apis/PushNotificationService";
import { AnimatePresence, motion } from "framer-motion";
import { TagSelector } from "@/components/common/tag-selector";
import { cn } from "@/lib/utils";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter, FormSectionCard } from "@/components/common/form/full-screen-form";
import { ServingService } from "@/apis";
import { LinkedResourceCard } from "@/components/common/form/linked-resource-card";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";

interface Props {
  mode: FormMode
  teamId: string
  worship: Worship
}

export function WorshipForm({ mode, teamId, worship }: Props) {
  const authUser = auth.currentUser
  const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom)
  const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const [beginningSongHeader, setBeginningSongHeader] = useRecoilState(worshipBeginningSongHeaderAtom)
  const [endingSongHeader, setEndingSongHeader] = useRecoilState(worshipEndingSongHeaderAtom)

  // Form State
  const [step, setStep] = useState(0); // 0: Date/Service, 1: Desc, 2: Setlist
  const [direction, setDirection] = useState(0); // -1: Back, 1: Next
  const totalSteps = 3;

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT) ? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT) ? worship?.description ?? "" : "",
    link: (mode === FormMode.EDIT) ? worship?.link ?? "" : "",
  })
  const [serviceTagIds, setServiceTagIds] = useState<string[]>((mode === FormMode.EDIT) ? worship?.service_tags ?? [] : [])
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT) ? timestampToDate(worship?.worship_date) : new Date())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [availableServingSchedules, setAvailableServingSchedules] = useState<any[]>([]);
  const [linkedServingId, setLinkedServingId] = useState<string | null>(null);

  // Date Helpers
  const upcomingFriday = nextFriday(new Date());
  const upcomingSunday = nextSunday(new Date());
  const formattedUpcomingFriday = format(upcomingFriday, 'yyyy-MM-dd');
  const formattedUpcomingSunday = format(upcomingSunday, 'yyyy-MM-dd');

  const clearContents = useCallback(() => {
    setIsLoading(false)
    setSelectedWorshipSongHeaderList([])
    setBeginningSongHeader({ id: "", note: "", selected_music_sheet_ids: [] })
    setEndingSongHeader({ id: "", note: "", selected_music_sheet_ids: [] })
  }, [setBeginningSongHeader, setEndingSongHeader, setSelectedWorshipSongHeaderList])

  useEffect(() => {
    return () => clearContents()
  }, [clearContents]);

  /* Initialize selected songs and form data */
  useEffect(() => {
    if (mode === FormMode.EDIT && worship) {
      setSelectedWorshipSongHeaderList(worship.songs || []);
      setServiceTagIds(worship.service_tags || []);
      setBasicInfo({
        title: worship.title || "",
        description: worship.description || "",
        link: worship.link || ""
      });
      setDate(timestampToDate(worship.worship_date));
      if (worship.serving_schedule_id) {
        setLinkedServingId(worship.serving_schedule_id);
      }
    }
  }, [mode, setSelectedWorshipSongHeaderList, worship]);

  // Fetch Linked Servings when date changes
  useEffect(() => {
    const fetchLinkedServings = async () => {
      if (!date) return;
      try {
        // Assuming serving schedules use 'yyyy-MM-dd' format
        const dateStr = format(date, 'yyyy-MM-dd');
        const schedules = await ServingService.getSchedules(teamId, dateStr, dateStr);
        // Filter schedules to only show those that have matching tags
        const filteredSchedules = schedules.filter(s =>
          serviceTagIds.some(t => s.service_tags?.includes(t)) ||
          (mode === FormMode.EDIT && s.id === worship.serving_schedule_id) // Always include currently linked in Edit mode
        );

        setAvailableServingSchedules(filteredSchedules);

        // Unified Auto-select Logic for both CREATE and EDIT
        // 1. If currently selected ID is still valid in the new filtered list, keep it.
        // 2. If not, but there is a match in the filtered list, select the first one.
        // 3. Otherwise, specific to EDIT mode: if the original saved ID is in the list, revert to it (though step 1 might cover this if state was init correctly).
        // 4. Else, clear selection.

        const currentSelectionExists = filteredSchedules.some(s => s.id === linkedServingId);

        if (currentSelectionExists) {
          // Keep current selection
        } else if (filteredSchedules.length > 0) {
          // Auto-select the first match (since strict filtering allows only valid tag+date matches)
          setLinkedServingId(filteredSchedules[0].id);
        } else {
          setLinkedServingId(null);
        }
      } catch (error) {
        console.error("Failed to fetch serving schedules", error);
      }
    };
    fetchLinkedServings();
  }, [date, teamId, serviceTagIds, mode, worship?.id, linkedServingId]); // Added tags dependency to re-run when tags change

  // Real-time Duplicate Check
  const serviceTagNames = serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id);
  const { isDuplicate, duplicateId, errorMessage: duplicateErrorMessage } = useServiceDuplicateCheck({
    teamId,
    date,
    serviceTagIds,
    serviceTagNames,
    mode,
    currentId: worship?.id,
    fetcher: async (tid, dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const worships = await WorshipService.getWorshipsByDate(tid, dateObj);
      return worships.map(w => ({ ...w, id: w.id! }));
    }
  });

  // Validation Check
  const isSessionValid = () => {
    if (!authUser) {
      toast({ title: "Please login first", variant: "destructive" })
      router.push("/login")
      return false
    }
    return true
  }

  const getWorshipInput = () => {
    const serviceTagNames = serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id);
    return {
      title: serviceTagNames.join(" "),
      service_tags: serviceTagIds,
      description: basicInfo.description,
      date: date,
      link: basicInfo.link,
      worshipSongHeaders: selectedWorshipSongHeaderList,
      beginningSong: beginningSongHeader,
      endingSong: endingSongHeader,
      related_serving_id: linkedServingId // Save linked serving ID
    } as any
  }

  async function handleCreate() {
    setIsLoading(true)
    if (!isSessionValid()) return

    try {
      const worshipInput = getWorshipInput()
      const worshipId = await WorshipService.addNewWorship(authUser?.uid, teamId, worshipInput);
      await PushNotificationService.notifyTeamNewWorship(teamId, authUser?.uid, worshipInput.date, worshipInput.title);

      toast({ title: `New service created!` })
      cleanupAndRedirect(worshipId)
    } catch (e) {
      handleError(e)
    }
  }

  async function handleEdit() {
    setIsLoading(true)
    if (!isSessionValid()) return

    try {
      const worshipInput = getWorshipInput()
      if (!worship?.id) throw new Error("No worship ID")

      await WorshipService.updateWorship(authUser?.uid, worship?.id, worshipInput);
      toast({ title: `Service updated` })
      cleanupAndRedirect(worship?.id)
    } catch (e) {
      handleError(e)
    }
  }

  const cleanupAndRedirect = (worshipId: string) => {
    setIsLoading(false)
    clearContents()
    setWorshipUpdater(prev => prev + 1)
    setWorshipIdsUpdater(prev => prev + 1)
    router.push(getPathPlan(teamId) + "?expanded=" + worshipId)
  }

  const handleError = (e: any) => {
    console.error("err", e)
    toast({ title: "Something went wrong", variant: "destructive" })
    setIsLoading(false)
  }

  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  }

  const nextStep = async () => {
    if (step < totalSteps - 1) goToStep(step + 1);
  }

  const prevStep = () => {
    if (step > 0) goToStep(step - 1);
  }

  // Animation Variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
      rotateY: direction > 0 ? 20 : -20,
      zIndex: 0,
      position: 'absolute' as const
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      position: 'relative' as const
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
      rotateY: direction < 0 ? 20 : -20,
      position: 'absolute' as const
    })
  };


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
                        <span className="font-semibold text-orange-900">
                          {serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id).join(", ")}
                        </span>
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
                  description: sch.date
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
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex items-end justify-between px-2 pb-1">
                <div>
                  <Label className="text-xs font-bold text-primary uppercase tracking-wider">Final Step</Label>
                  <h2 className="text-2xl font-bold text-foreground leading-none">Setlist</h2>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 mb-1">
                  {selectedWorshipSongHeaderList.length} Songs
                </span>
              </div>

              {/* Card (Full Height) */}
              <FormSectionCard className="p-0 overflow-hidden space-y-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {beginningSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.BEGINNING} songHeader={beginningSongHeader} />}
                  {selectedWorshipSongHeaderList.map((songHeader, i) => (
                    <AddedSongHeaderDefault key={i} teamId={teamId} songOrder={i + 1} songHeader={songHeader} />
                  ))}
                  {endingSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.ENDING} songHeader={endingSongHeader} />}

                  <div className="pt-2 flex justify-center">
                    <AddWorshipSongDialogTrigger teamId={teamId}>
                      <AddSongButton />
                    </AddWorshipSongDialogTrigger>
                  </div>
                </div>
              </FormSectionCard>
            </motion.div>
          )}

        </AnimatePresence>
      </FullScreenFormBody>

      <FullScreenFormFooter
        errorMessage={duplicateErrorMessage}
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
          className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
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
