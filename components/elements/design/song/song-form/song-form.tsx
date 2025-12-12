"use client"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { SongService, StorageService, TagService } from "@/apis";
import { FormMode } from "@/components/constants/enums";
import { useRouter } from "next/navigation";
import { getPathSongDetail } from "@/components/util/helper/routes";
import { auth } from "@/firebase";
import { songAtom, songUpdaterAtom } from "@/global-states/song-state";
import { ImageFileContainer, MusicSheetContainer } from "@/components/constants/types";
import { v4 as uuid } from "uuid";
import MusicSheetService from "@/apis/MusicSheetService";
import { musicSheetIdsUpdaterAtom, musicSheetsBySongIdAtom, musicSheetUpdaterAtom } from "@/global-states/music-sheet-state";
import { MusicSheet } from "@/models/music_sheet";
import { getAllUrlsFromMusicSheetContainers, getAllUrlsFromSongMusicSheets } from "@/components/util/helper/helper-functions";
import { TagMultiSelect } from "@/app/board/[teamId]/(song)/song-board/_components/tag-multi-select";
import { ArrowRight, Check, ChevronLeft, LinkIcon, Music, PlusIcon } from "lucide-react";
import { MusicSheetUploaderBox } from "@/components/elements/design/song/song-form/music-sheet-uploader-box";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  mode: FormMode
  teamId: string
  songId?: string
}
export interface SongInput {
  title: string
  subtitle: string
  author: string
  version: string
  link: string
  tags: Array<string>
  bpm: number | null
  description: string
}

export function SongForm({ mode, teamId, songId }: Props) {
  const song = useRecoilValue(songAtom(songId))
  const songUpdater = useSetRecoilState(songUpdaterAtom)
  const musicSheetIdsUpdater = useSetRecoilState(musicSheetIdsUpdaterAtom)
  const musicSheetUpdater = useSetRecoilState(musicSheetUpdaterAtom)
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const authUser = auth.currentUser
  const team = useRecoilValue(teamAtom(teamId))


  // Form State
  const [step, setStep] = useState(0); // 0: Identity, 1: Details, 2: Context, 3: Sheets
  const [direction, setDirection] = useState(0);
  const totalSteps = 4;

  const [songInput, setSongInput] = useState<SongInput>({
    title: (mode === FormMode.EDIT) ? song?.title ?? "" : "",
    subtitle: (mode === FormMode.EDIT) ? song?.subtitle ?? "" : "",
    author: (mode === FormMode.EDIT) ? song?.original.author ?? "" : "",
    version: (mode === FormMode.EDIT) ? song?.version ?? "" : "",
    link: (mode === FormMode.EDIT) ? song?.original.url ?? "" : "",
    tags: (mode === FormMode.EDIT) ? song?.tags ?? [] : [],
    bpm: (mode === FormMode.EDIT) ? song?.bpm ?? null : null,
    description: (mode === FormMode.EDIT) ? song?.description ?? "" : ""
  })

  const [musicSheetContainers, setMusicSheetContainers] = useState<Array<MusicSheetContainer>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const _musicSheetContainers: MusicSheetContainer[] = []
      musicSheets?.forEach((musicSheet) => {
        const mContainer: MusicSheetContainer = {
          id: musicSheet?.id,
          tempId: uuid(),
          key: musicSheet?.key,
          imageFileContainers: musicSheet?.urls?.map(url => {
            const iContainer: ImageFileContainer = { id: "", file: null, url: url, isLoading: false, isUploadedInDatabase: true }
            return iContainer
          })
        }
        _musicSheetContainers.push(mContainer)
      })
      setMusicSheetContainers(_musicSheetContainers)
    }
  }, [mode, musicSheets])

  function createValidCheck() {
    if (!authUser?.uid) {
      console.log("error");
      setIsLoading(false)
      return false
    }
    return true
  }

  function clearContents() {
    const songInput: SongInput = { title: "", subtitle: "", author: "", version: "", link: "", tags: [], bpm: null, description: "" }
    setSongInput(songInput)
    setMusicSheetContainers([])
  }

  async function handleCreate() {
    setIsLoading(true)
    if (!createValidCheck()) return false

    try {
      const newSongId = await SongService.addNewSong(authUser?.uid, teamId, songInput, musicSheetContainers)
      if (!newSongId) {
        toast({ description: `Fail to create a song. Please try again.` })
        return
      }

      const uploadedMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      if (await MusicSheetService.addNewMusicSheets(authUser?.uid, newSongId, uploadedMusicSheetContainers) === false) {
        console.log("err:song-board-form:handleCreate. Fail to create music sheets."); return
      }

      if (await TagService.addNewTags(teamId, songInput.tags) === false) {
        console.log("err:song-board-form:handleCreate. Fail to create tags")
      }

      toast({
        title: `New Song Created!`,
        description: `${team?.name} - ${songInput.title}`,
      })

      songUpdater((prev) => prev + 1) // update song-board board (locally)
      router.push(getPathSongDetail(teamId, newSongId))
      clearContents()
    }
    catch (e) {
      console.log("err", e)
      toast({
        description: `Fail to create a song. Please try again.`,
      })
    }
    finally {
      clearContents()
      setIsLoading(false)
    }
  }

  function editValidCheck() {
    if (!authUser?.uid || (song == null || song.id == null)) {
      setIsLoading(false)
      toast({
        title: "Fail to edit song-board",
        description: "Something went wrong. Please try again later."
      })
      return false
    }
    return true
  }

  async function handleEdit() {
    setIsLoading(true)
    if (!editValidCheck()) return false

    try {
      const promises = [];

      // Delete music sheet images if removed.
      const newMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      const urlsToDelete = getRemovedMusicSheetUrls(musicSheets, newMusicSheetContainers)
      promises.push(StorageService.deleteFileByUrls(urlsToDelete))

      // Delete music sheet document if removed.
      const musicSheetIdsToDelete = getRemovedMusicSheetIds(musicSheets, newMusicSheetContainers)
      musicSheetIdsToDelete.forEach(id => {
        promises.push(MusicSheetService.delete(id))
      })

      // Update music sheet
      newMusicSheetContainers.forEach(mContainer => {
        promises.push(MusicSheetService.updateMusicSheet(authUser?.uid, song?.id, mContainer))
      })
      // Update Song and tags
      promises.push(SongService.updateSong(authUser?.uid, song?.id, songInput, musicSheetContainers));
      promises.push(TagService.addNewTags(teamId, songInput?.tags));

      await Promise.all(promises)

      musicSheetIdsUpdater(prev => prev + 1)
      musicSheetUpdater(prev => prev + 1)
      songUpdater(prev => prev + 1)

      toast({ title: "Song edited successfully." })
      setIsLoading(false)
      router.push(getPathSongDetail(teamId, songId))
    }
    catch (e) {
      console.log(e)
    }
    finally {
      clearContents()
      setIsLoading(false)
    }
  }

  async function uploadMusicSheetContainers(_musicSheetContainers: MusicSheetContainer[]) {
    const newMusicSheetContainers = []
    for (const mContainer of _musicSheetContainers) {
      const newMContainer = await StorageService.uploadMusicSheetContainer(teamId, mContainer)
      if (!newMContainer) {
        console.log("Song:handleCreate: fail to upload music sheet container."); continue
      }
      newMusicSheetContainers.push(newMContainer)
    }
    return newMusicSheetContainers
  }

  function getRemovedMusicSheetUrls(prevMusicSheets: MusicSheet[], newMusicSheetContainers: MusicSheetContainer[]) {
    const prevUrls = getAllUrlsFromSongMusicSheets(prevMusicSheets)
    const newUrls = getAllUrlsFromMusicSheetContainers(newMusicSheetContainers)
    return prevUrls.filter((pUrl) => !newUrls.includes(pUrl))
  }

  function getRemovedMusicSheetIds(prevMusicSheets: MusicSheet[], newMusicSheetContainers: MusicSheetContainer[]) {
    const prevIds = prevMusicSheets?.map(ms => ms?.id)
    const newIds = newMusicSheetContainers?.map(mContainer => mContainer?.id)
    return prevIds.filter(pId => !newIds.includes(pId))
  }

  function handleAddNewMusicSheet() {
    setMusicSheetContainers((prev) => ([...prev, {
      tempId: uuid(),
      key: "",
      imageFileContainers: []
    }]))
  }

  function setKeyToMusicSheet(tempId: string, key: string) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => (musicSheet?.tempId === tempId) ? { ...musicSheet, key: key } : musicSheet)]))
  }
  function setImageFileContainersToMusicSheet(tempId: string, imageFileContainers: Array<ImageFileContainer>) {
    setMusicSheetContainers((prev) => ([
      ...prev.map((musicSheet) => ((musicSheet?.tempId === tempId) ? { ...musicSheet, imageFileContainers } : musicSheet))
    ])
    )
  }

  function addImageFileContainerToMusicSheet(tempId: string, imageFileContainer: ImageFileContainer) {
    setMusicSheetContainers((prev) => {
      const result: Array<MusicSheetContainer> = []
      prev.forEach((_musicSheet) => {
        if (_musicSheet?.tempId === tempId) {
          const newMusicSheet = { ..._musicSheet }
          newMusicSheet.imageFileContainers = [...newMusicSheet?.imageFileContainers.filter((iContainer) => iContainer?.id !== imageFileContainer?.id), imageFileContainer]
          result.push(newMusicSheet)
        }
        else {
          result.push(_musicSheet)
        }
      })
      return result
    })
  }

  function removeImageFromMusicSheet(tempId: string, imageFileContainerIndex: number) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => {
      if (musicSheet.tempId !== tempId) return musicSheet

      const newImageFileContainers = musicSheet.imageFileContainers.filter((_, index) => index !== imageFileContainerIndex)
      return { ...musicSheet, imageFileContainers: newImageFileContainers }
    })]))
  }

  function removeMusicSheetContainer(tempId: string) {
    setMusicSheetContainers((prev) => ([...prev.filter(mContainer => mContainer.tempId !== tempId)]))
  }

  // Navigation Logic
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

      {/* 1. Header Progress */}
      <div className="fixed top-8 left-0 right-0 z-50 px-6 flex flex-col items-center gap-4">
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white/20">
          {["Identity", "Details", "Context", "Sheets"].map((label, idx) => (
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

          {/* Step 1: Identity */}
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
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 1</Label>
                <h2 className="text-2xl font-bold text-gray-900">Project Identity</h2>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Title</Label>
                  <Input
                    autoFocus
                    placeholder="Song Title..."
                    value={songInput.title}
                    onChange={(e) => setSongInput(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl font-black bg-gray-50 border-gray-100 h-16 rounded-2xl focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Subtitle</Label>
                  <Input
                    placeholder="Subtitle (Optional)"
                    value={songInput.subtitle}
                    onChange={(e) => setSongInput(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="text-lg font-medium bg-gray-50 border-gray-100 h-14 rounded-2xl focus-visible:ring-ring"
                  />
                </div>
              </div>

              <Button
                className="h-14 w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl mt-auto transition-transform active:scale-95"
                onClick={nextStep}
                disabled={!songInput.title}
              >
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Details */}
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
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 2</Label>
                <h2 className="text-2xl font-bold text-gray-900">Song Details</h2>
                <h3 className="text-xl font-medium text-primary break-words">{songInput.title}</h3>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Author</Label>
                    <Input
                      placeholder="Original Author"
                      value={songInput.author}
                      onChange={(e) => setSongInput(prev => ({ ...prev, author: e.target.value }))}
                      className="bg-gray-50 border-gray-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Version</Label>
                    <Input
                      placeholder="v1.0"
                      value={songInput.version}
                      onChange={(e) => setSongInput(prev => ({ ...prev, version: e.target.value }))}
                      className="bg-gray-50 border-gray-100 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">BPM</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={songInput.bpm ?? ""}
                    onChange={(e) => setSongInput(prev => ({ ...prev, bpm: Number(e.target.value) }))}
                    className="bg-gray-50 border-gray-100 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Reference Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="https://youtube.com/..."
                      value={songInput.link}
                      onChange={(e) => setSongInput(prev => ({ ...prev, link: e.target.value }))}
                      className="pl-9 bg-gray-50 border-gray-100 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  className="h-14 flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl active:scale-95 transition-all"
                  onClick={nextStep}
                >
                  Next Step
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
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 3</Label>
                <h2 className="text-2xl font-bold text-gray-900">Context & Tags</h2>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Tags</Label>
                  <TagMultiSelect input={songInput} setInput={setSongInput} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 font-bold uppercase ml-1">Description</Label>
                  <Textarea
                    placeholder="Add any notes or description about the song..."
                    value={songInput.description}
                    onChange={(e) => setSongInput(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px] text-base bg-gray-50 border-gray-100 rounded-xl resize-none p-3 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  className="h-14 flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl active:scale-95 transition-all"
                  onClick={nextStep}
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Sheets */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col h-full space-y-3 w-full"
            >
              <div className="flex items-end justify-between px-2 pb-1">
                <div>
                  <Label className="text-sm font-bold text-primary uppercase tracking-wider">Final Step</Label>
                  <h2 className="text-2xl font-bold text-gray-900 leading-none">Music Sheets</h2>
                </div>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={handleAddNewMusicSheet}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Sheet
                </Button>
              </div>

              <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                {musicSheetContainers.length === 0 ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleAddNewMusicSheet}
                  >
                    <Music className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No music sheets yet</p>
                    <p className="text-xs">Click to add a sheet</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {musicSheetContainers?.map((musicSheet, index) => (
                      <MusicSheetUploaderBox
                        key={index}
                        index={index}
                        musicKey={musicSheet.key}
                        setMusicKey={setKeyToMusicSheet}
                        tempId={musicSheet?.tempId}
                        imageFileContainers={musicSheet?.imageFileContainers}
                        handleAddImageFileContainer={addImageFileContainerToMusicSheet}
                        handleRemoveImageFileContainer={removeImageFromMusicSheet}
                        handleRemoveMusicSheetContainer={removeMusicSheetContainer}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-auto pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                <Button variant="outline" className="h-14 w-14 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600" onClick={prevStep}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={mode === FormMode.CREATE ? handleCreate : handleEdit}
                  disabled={isLoading}
                  className="h-14 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                >
                  {isLoading ? "Saving..." : (mode === FormMode.CREATE ? "Create Song" : "Save Changes")} <Check className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
