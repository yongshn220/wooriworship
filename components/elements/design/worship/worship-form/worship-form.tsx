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
import { LinkIcon, CalendarIcon, Music, ArrowRight, ChevronLeft, Check } from "lucide-react";
import PushNotificationService from "@/apis/PushNotificationService";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [step, setStep] = useState(0); // 0: Title, 1: Date, 2: Desc, 3: Setlist
  const [direction, setDirection] = useState(0); // -1: Back, 1: Next
  const totalSteps = 4;

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT) ? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT) ? worship?.description ?? "" : "",
    link: (mode === FormMode.EDIT) ? worship?.link ?? "" : "",
  })
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT) ? timestampToDate(worship?.worship_date) : new Date())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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

  /* Initialize selected songs */
  useEffect(() => {
    if (mode === FormMode.EDIT) {
      setSelectedWorshipSongHeaderList(worship?.songs)
    }
  }, [mode, setSelectedWorshipSongHeaderList, worship?.songs])

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
    return {
      title: basicInfo.title,
      description: basicInfo.description,
      date: date,
      link: basicInfo.link,
      worshipSongHeaders: selectedWorshipSongHeaderList,
      beginningSong: beginningSongHeader,
      endingSong: endingSongHeader,
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
    console.log("err", e)
    toast({ title: "Something went wrong", variant: "destructive" })
    setIsLoading(false)
  }

  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  }

  const nextStep = () => {
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
    <div className="fixed inset-0 z-[40] bg-gray-50 flex flex-col items-center justify-center overflow-hidden">

      {/* 1. Interactive Header Progress (Mid-Top) */}
      <div className="fixed top-8 left-0 right-0 z-50 px-6 flex flex-col items-center gap-4">
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white/20">
          {["Title", "When", "Context", "Setlist"].map((label, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                step === idx
                  ? "bg-black text-white shadow-md scale-105"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="w-full max-w-xl h-full px-4 sm:px-6 pt-24 pb-20 flex flex-col relative perspective-1000">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>

          {/* Step 1: Title */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-8 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step 1</Label>
                <h2 className="text-2xl font-bold text-gray-900">What is the Title?</h2>
              </div>

              {/* Card */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-6">
                <Input
                  autoFocus
                  placeholder="Service Title..."
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                  className="text-3xl font-black bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-gray-200 text-center"
                />

                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { label: "금요 예배", date: upcomingFriday },
                    { label: "주일 예배", date: upcomingSunday },
                    { label: `${formattedUpcomingFriday} 금요 예배`, date: upcomingFriday },
                    { label: `${formattedUpcomingSunday} 주일 예배`, date: upcomingSunday }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setBasicInfo(prev => ({ ...prev, title: chip.label }));
                        setDate(chip.date);
                      }}
                      className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Button
                className="h-14 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl mt-auto transition-transform active:scale-95"
                onClick={nextStep}
                disabled={!basicInfo.title}
              >
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Date */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-8 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step 2</Label>
                <h2 className="text-2xl font-bold text-gray-900">When is the Service?</h2>
                <h3 className="text-xl font-medium text-blue-600 break-keep">{basicInfo.title}</h3>
              </div>

              {/* Card */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex justify-center">
                <WorshipDatePicker date={date} setDate={setDate} />
              </div>

              {/* Action */}
              <div className="flex gap-4 mt-auto">
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  className="h-14 flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl active:scale-95 transition-all"
                  onClick={nextStep}
                >
                  Confirm Date
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Context */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-8 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step 3</Label>
                <h2 className="text-2xl font-bold text-gray-900">Add Context</h2>
              </div>

              {/* Card */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-4">
                <Textarea
                  autoFocus
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
                    className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-sm"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex gap-4 mt-auto">
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  className={cn(
                    "h-14 flex-1 rounded-full text-lg font-bold shadow-xl transition-all active:scale-95",
                    "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  onClick={nextStep}
                >
                  {!basicInfo.description && !basicInfo.link ? "Skip" : "Next Step"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Setlist */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col h-full space-y-3 w-full leading-relaxed" // Reduced space-y-6 to space-y-3
            >
              <div className="flex items-end justify-between px-2 pb-1"> {/* Align bottom, added padding */}
                <div>
                  <Label className="text-sm font-bold text-blue-600 uppercase tracking-wider">Final Step</Label>
                  <h2 className="text-2xl font-bold text-gray-900 leading-none">Setlist</h2>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 mb-1">
                  {selectedWorshipSongHeaderList.length} Songs
                </span>
              </div>

              {/* Card (Full Height) */}
              <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
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
              </div>

              {/* Action */}
              <div className="flex gap-4 mt-auto pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"> {/* Added extra 1.5rem padding */}
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={mode === FormMode.CREATE ? handleCreate : handleEdit}
                  disabled={isLoading}
                  className="h-14 flex-1 rounded-full bg-blue-600 text-white text-lg font-bold shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {isLoading ? "Saving..." : "Create Plan"} <Check className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
