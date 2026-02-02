"use client"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { teamAtom } from "@/global-states/teamState";
import { SongApi, StorageApi, TagApi } from "@/apis";
import { FormMode } from "@/components/constants/enums";
import { useRouter } from "next/navigation";
import { getPathSongDetail } from "@/components/util/helper/routes";
import { auth } from "@/firebase";
import { songAtom, songUpdaterAtom } from "@/global-states/song-state";
import { ImageFileContainer, MusicSheetContainer } from "@/components/constants/types";
import { v4 as uuid } from "uuid";
import MusicSheetApi from "@/apis/MusicSheetApi";
import { musicSheetIdsUpdaterAtom, musicSheetsBySongIdAtom, musicSheetUpdaterAtom } from "@/global-states/music-sheet-state";
import { MusicSheet } from "@/models/music_sheet";
import { getAllUrlsFromMusicSheetContainers, getAllUrlsFromSongMusicSheets } from "@/components/util/helper/helper-functions";
import { TagMultiSelect } from "@/app/board/[teamId]/(song)/song-board/_components/tag-multi-select";
import { ArrowRight, Check, ChevronLeft, LinkIcon, Music, PlusIcon } from "lucide-react";
import { MusicSheetUploaderBox } from "@/components/elements/design/song/song-form/music-sheet-uploader-box";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FullScreenForm, FullScreenFormBody, FullScreenFormFooter, FullScreenFormHeader } from "@/components/common/form/full-screen-form";
import { slideVariants } from "@/components/constants/animations";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Props {
  mode: FormMode
  teamId: string
  songId?: string
}
export interface SongInput {
  title: string
  subtitle: string
  author: string
  link: string
  tags: Array<string>
  description: string
}

export function SongForm({ mode, teamId, songId }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId: songId ?? "" }))
  const songUpdater = useSetRecoilState(songUpdaterAtom)
  const musicSheetIdsUpdater = useSetRecoilState(musicSheetIdsUpdaterAtom)
  const musicSheetUpdater = useSetRecoilState(musicSheetUpdaterAtom)
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom({ teamId, songId: songId ?? "" }))
  const authUser = auth.currentUser
  const team = useRecoilValue(teamAtom(teamId))


  // Form State
  const [step, setStep] = useState(0); // 0: Song Info, 1: Sheets
  const [direction, setDirection] = useState(0);
  const totalSteps = 2;

  const [songInput, setSongInput] = useState<SongInput>({
    title: (mode === FormMode.EDIT) ? song?.title ?? "" : "",
    subtitle: (mode === FormMode.EDIT) ? song?.subtitle ?? "" : "",
    author: (mode === FormMode.EDIT) ? song?.original.author ?? "" : "",
    link: (mode === FormMode.EDIT) ? song?.original.url ?? "" : "",
    tags: (mode === FormMode.EDIT) ? song?.tags ?? [] : [],
    description: (mode === FormMode.EDIT) ? song?.description ?? "" : ""
  })

  const [linkError, setLinkError] = useState<string>("")
  const [showExitDialog, setShowExitDialog] = useState(false)

  // Sync song data when it loads (Edit Mode)
  useEffect(() => {
    if (mode === FormMode.EDIT && song) {
      setSongInput(prev => ({
        ...prev,
        title: song.title ?? "",
        subtitle: song.subtitle ?? "",
        author: song.original.author ?? "",
        link: song.original.url ?? "",
        tags: song.tags ?? [],
        description: song.description ?? ""
      }));
    }
  }, [mode, song]);

  const [musicSheetContainers, setMusicSheetContainers] = useState<Array<MusicSheetContainer>>([])
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // URL validation function
  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return /^(www\.)?[\w-]+(\.[\w-]+)+/.test(url);
    }
  }

  // Dirty state tracking
  const isDirty = mode === FormMode.CREATE
    ? (songInput.title !== '' || songInput.subtitle !== '' || songInput.author !== '' || songInput.link !== '' || songInput.tags.length > 0 || songInput.description !== '' || musicSheetContainers.length > 0)
    : (songInput.title !== (song?.title ?? '') || songInput.subtitle !== (song?.subtitle ?? '') || songInput.author !== (song?.original.author ?? '') || songInput.link !== (song?.original.url ?? '') || JSON.stringify(songInput.tags) !== JSON.stringify(song?.tags ?? []) || songInput.description !== (song?.description ?? ''))


  useEffect(() => {
    if (mode === FormMode.EDIT && musicSheets && musicSheets.length > 0) {
      const _musicSheetContainers: MusicSheetContainer[] = []
      musicSheets.forEach((musicSheet) => {
        const mContainer: MusicSheetContainer = {
          id: musicSheet?.id,
          tempId: uuid(),
          key: musicSheet?.key,
          note: musicSheet?.note ?? "",
          imageFileContainers: musicSheet?.urls?.map(url => {
            const iContainer: ImageFileContainer = { id: "", file: null, url: url, isLoading: false, isUploadedInDatabase: true }
            return iContainer
          })
        }
        _musicSheetContainers.push(mContainer)
      })
      // Only update if length differs to avoid simple loops (basic check)
      setMusicSheetContainers(prev => {
        if (prev.length === 0 && _musicSheetContainers.length > 0) return _musicSheetContainers;
        return prev;
      })
    }
  }, [mode, musicSheets])

  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty])

  function createValidCheck() {
    if (!authUser?.uid) {
      console.log("error");
      setIsLoading(false)
      return false
    }
    return true
  }

  function clearContents() {
    const songInput: SongInput = { title: "", subtitle: "", author: "", link: "", tags: [], description: "" }
    setSongInput(songInput)
    setMusicSheetContainers([])
  }

  async function handleCreate() {
    setIsLoading(true)
    if (!createValidCheck()) return false

    try {
      const newSongId = await SongApi.addNewSong(authUser?.uid, teamId, songInput, musicSheetContainers)
      if (!newSongId) {
        toast({ description: `Fail to create a song. Please try again.` })
        return
      }

      const uploadedMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      if (await MusicSheetApi.addNewMusicSheets(authUser?.uid, teamId, newSongId, uploadedMusicSheetContainers) === false) {
        console.log("err:song-board-form:handleCreate. Fail to create music sheets."); return
      }

      if (await TagApi.addNewTags(teamId, songInput.tags) === false) {
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
      promises.push(StorageApi.deleteFileByUrls(urlsToDelete))

      // Delete music sheet document if removed.
      const musicSheetIdsToDelete = getRemovedMusicSheetIds(musicSheets, newMusicSheetContainers)
      musicSheetIdsToDelete.forEach(id => {
        promises.push(MusicSheetApi.deleteMusicSheet(teamId, song!.id, id))
      })

      // Update music sheet
      newMusicSheetContainers.forEach(mContainer => {
        promises.push(MusicSheetApi.updateMusicSheet(authUser?.uid, teamId, song!.id, mContainer))
      })
      // Update Song and tags
      promises.push(SongApi.updateSong(authUser?.uid, teamId, song!.id, songInput, musicSheetContainers));
      promises.push(TagApi.addNewTags(teamId, songInput?.tags));

      await Promise.all(promises)

      musicSheetIdsUpdater(prev => prev + 1)
      musicSheetUpdater(prev => prev + 1)
      songUpdater(prev => prev + 1)

      toast({ title: "Song edited successfully." })
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
    const results = await Promise.allSettled(
      _musicSheetContainers.map(mContainer => StorageApi.uploadMusicSheetContainer(teamId, mContainer))
    )
    const newMusicSheetContainers: MusicSheetContainer[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        newMusicSheetContainers.push(result.value)
      } else {
        const key = _musicSheetContainers[index]?.key || `Sheet ${index + 1}`
        toast({ title: `Failed to upload ${key}`, description: "This sheet was skipped." })
      }
    })
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
    const newContainer: MusicSheetContainer = {
      tempId: uuid(),
      key: "",
      note: "",
      imageFileContainers: []
    }
    setMusicSheetContainers((prev) => {
      const newList = [...prev, newContainer]
      setSelectedSheetIndex(newList.length - 1)
      return newList
    })
  }

  function setKeyToMusicSheet(tempId: string, key: string) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => (musicSheet?.tempId === tempId) ? { ...musicSheet, key: key } : musicSheet)]))
  }

  function setNoteToMusicSheet(tempId: string, note: string) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => (musicSheet?.tempId === tempId) ? { ...musicSheet, note: note } : musicSheet)]))
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
    setMusicSheetContainers((prev) => {
      const newList = prev.filter(mContainer => mContainer.tempId !== tempId)
      // Adjust selected index if needed
      setSelectedSheetIndex((prevIdx) => {
        if (newList.length === 0) return 0
        if (prevIdx >= newList.length) return newList.length - 1
        return prevIdx
      })
      return newList
    })
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

  const selectedSheet = musicSheetContainers[selectedSheetIndex]

  return (
    <>
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Are you sure you want to leave?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FullScreenForm data-testid="song-form">
        <FullScreenFormHeader
          steps={["Song Info", "Sheets"]}
          currentStep={step}
          onStepChange={goToStep}
          onClose={() => { if (isDirty) { setShowExitDialog(true) } else { router.back() } }}
        />

      <FullScreenFormBody>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>

          {/* Step 1: Song Info */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-6 w-full"
            >
              <div className="space-y-2 text-center">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 1</Label>
                <h2 className="text-2xl font-bold text-foreground">Song Info</h2>
              </div>

              <div className="bg-card p-6 rounded-3xl shadow-xl border border-border flex flex-col gap-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Title</Label>
                  <Input
                    autoFocus
                    placeholder="Song Title..."
                    value={songInput.title}
                    onChange={(e) => setSongInput(prev => ({ ...prev, title: e.target.value }))}
                    className="text-xl font-bold bg-secondary/40 border-border h-14 rounded-2xl focus-visible:ring-ring"
                    data-testid="song-title-input"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Subtitle</Label>
                  <Input
                    placeholder="Subtitle (Optional)"
                    value={songInput.subtitle}
                    onChange={(e) => setSongInput(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="text-base bg-secondary/40 border-border h-12 rounded-xl focus-visible:ring-ring"
                  />
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Author</Label>
                  <Input
                    placeholder="Original Author"
                    value={songInput.author}
                    onChange={(e) => setSongInput(prev => ({ ...prev, author: e.target.value }))}
                    className="bg-secondary/40 border-border h-12 rounded-xl"
                  />
                </div>

                {/* Reference Link */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Reference Link</Label>
                  <div>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://youtube.com/..."
                        value={songInput.link}
                        onChange={(e) => {
                          const newLink = e.target.value
                          setSongInput(prev => ({ ...prev, link: newLink }))
                          if (isValidUrl(newLink)) {
                            setLinkError("")
                          } else {
                            setLinkError("Please enter a valid URL")
                          }
                        }}
                        className="pl-9 bg-secondary/40 border-border h-12 rounded-xl"
                      />
                    </div>
                    {linkError && <p className="text-xs text-destructive ml-1">{linkError}</p>}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Tags</Label>
                  <TagMultiSelect input={songInput} setInput={setSongInput} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Description</Label>
                  <Textarea
                    placeholder="Add any notes about the song..."
                    value={songInput.description}
                    onChange={(e) => setSongInput(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px] text-sm bg-secondary/40 border-border rounded-xl resize-none p-3 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Music Sheets */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col h-full space-y-4 w-full"
            >
              <div className="space-y-2 text-center">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Final Step</Label>
                <h2 className="text-2xl font-bold text-foreground">Music Sheets</h2>
              </div>

              {/* Key Tab Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 pb-1">
                {musicSheetContainers.map((sheet, index) => (
                  <button
                    key={sheet.tempId}
                    onClick={() => setSelectedSheetIndex(index)}
                    className={cn(
                      "shrink-0 flex flex-col items-center px-4 py-2 rounded-2xl text-sm font-semibold transition-all",
                      selectedSheetIndex === index
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span>{sheet.key || "New"}</span>
                    {sheet.note && (
                      <span className={cn(
                        "text-[10px] font-medium mt-0.5 max-w-[80px] truncate",
                        selectedSheetIndex === index ? "text-primary-foreground/70" : "text-muted-foreground/60"
                      )}>
                        {sheet.note}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleAddNewMusicSheet}
                  className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-semibold border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content Panel */}
              <div className="flex-1 bg-card rounded-3xl shadow-xl border border-border overflow-hidden flex flex-col">
                {musicSheetContainers.length === 0 ? (
                  /* Empty State */
                  <div
                    className="flex-1 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={handleAddNewMusicSheet}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Music className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="text-base font-semibold text-muted-foreground">Add your first music sheet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Each sheet represents a key (e.g. Em, G)</p>
                  </div>
                ) : selectedSheet ? (
                  /* Selected Sheet Content */
                  <div className="flex-1 overflow-y-auto p-5">
                    <MusicSheetUploaderBox
                      tempId={selectedSheet.tempId}
                      musicKey={selectedSheet.key}
                      musicNote={selectedSheet.note ?? ""}
                      setMusicKey={setKeyToMusicSheet}
                      setMusicNote={setNoteToMusicSheet}
                      imageFileContainers={selectedSheet.imageFileContainers}
                      handleAddImageFileContainer={addImageFileContainerToMusicSheet}
                      handleRemoveImageFileContainer={removeImageFromMusicSheet}
                      handleRemoveMusicSheetContainer={removeMusicSheetContainer}
                    />
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </FullScreenFormBody>

      <FullScreenFormFooter>
        <div className="w-12 h-12 flex-none">
          <Button variant="outline" className="h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground shadow-sm disabled:opacity-0 disabled:pointer-events-none transition-opacity duration-300" onClick={prevStep} disabled={step === 0}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <Button
          onClick={step === totalSteps - 1 ? (mode === FormMode.CREATE ? handleCreate : handleEdit) : nextStep}
          disabled={isLoading || (step === 0 && !songInput.title) || !!linkError}
          className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
          data-testid="form-submit"
        >
          {isLoading ? "Saving..." : step === totalSteps - 1 ? (mode === FormMode.CREATE ? "Create Song" : "Save Changes") : "Next Step"}
          {step === totalSteps - 1 ? <Check className="w-5 h-5 ml-1" /> : <ArrowRight className="w-5 h-5 ml-1" />}
        </Button>
      </FullScreenFormFooter>
    </FullScreenForm>
    </>
  )
}
