'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {TagMultiSelect} from "@/app/board/[teamId]/song/_components/tag-multi-select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {SongService, StorageService, TagService} from "@/apis";
import {FormMode} from "@/components/constants/enums";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {auth} from "@/firebase";
import {currentTeamSongIdsAtom, songAtom, songUpdaterAtom} from "@/global-states/song-state";
import useViewportHeight from "@/components/hook/use-viewport-height";
import PdfUploader from "@/app/board/[teamId]/song/_components/pdf-uploader";
import {ImageFileContainer} from "@/components/constants/types";


interface Props {
  mode: FormMode
  isOpen: boolean
  setIsOpen: Function
  songId?: string
}
export interface SongInput {
  title: string
  subtitle: string
  author: string
  version: string
  key: string
  link: string
  tags: Array<string>
  bpm: number | null
  description: string
}

export function SongForm({mode, isOpen, setIsOpen, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const setSongUpdater = useSetRecoilState(songUpdaterAtom)
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom(teamId))
  const [input, setInput] = useState<SongInput>({
    title: (mode === FormMode.EDIT)? song?.title?? "" : "",
    subtitle: (mode === FormMode.EDIT)? song?.subtitle?? "" : "",
    author: (mode === FormMode.EDIT)? song?.original.author?? "" : "",
    version: (mode === FormMode.EDIT)? song?.version?? "" : "",
    key: (mode === FormMode.EDIT)? song?.key?? "":"",
    link: (mode === FormMode.EDIT)? song?.original.url?? "" : "",
    tags: (mode === FormMode.EDIT)? song?.tags?? [] : [],
    bpm: (mode === FormMode.EDIT)? song?.bpm?? null : null,
    description: (mode === FormMode.EDIT)? song?.description?? "" : ""
  })
  const [imageFileContainers, setImageFileContainers] = useState<Array<ImageFileContainer>>([])
  const [isLoading, setIsLoading] = useState(false)
  const viewportHeight = useViewportHeight();
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const _imageFileContainers = song?.music_sheet_urls.map((url) => ({id: "", file: null, url: url, isLoading:false})) as Array<ImageFileContainer>
    if (_imageFileContainers)
      setImageFileContainers(_imageFileContainers)
  }, [song?.music_sheet_urls])

  function createValidCheck() {
    if (!authUser?.uid) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return false
    }
    return true
  }

  function clearContents() {
    setInput({title: "", subtitle: "", author: "", version: "", key: "", link: "", tags: [], bpm: null, description: ""})
    setImageFileContainers([])
  }

  async function handleCreate() {
    setIsLoading(true)

    if (!createValidCheck()) return false

    try {
      const downloadUrls = await StorageService.uploadMusicSheets(teamId, imageFileContainers);
      const songInput = {...input, music_sheet_urls: downloadUrls}
      const promises = [];
      promises.push(SongService.addNewSong(authUser?.uid, teamId, songInput));
      promises.push(TagService.addNewTags(teamId, songInput.tags));
      const promiseResults = await Promise.all(promises)
      const songId = promiseResults[0] as string
      if (!songId) {
        toast({
          description: `Fail to create a song. Please try again.`,
        })
      }
      else {
        toast({
          title: `New Song Created!`,
          description: `${team?.name} - ${songInput.title}`,
        })
        setCurrentTeamSongIds((prev) => ([...prev, songId])) // update song board (locally)
        router.push(getPathSongDetail(teamId, songId))
        clearContents()
      }
    }
    catch (e) {
      console.log("err", e)
    }
    finally {
      clearContents()
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  function editValidCheck() {
    if (!authUser?.uid|| (song == null || song.id == null)) {
      setIsOpen(false)
      setIsLoading(false)
      toast({
        title: "Fail to edit song",
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
      const curImageUrls = imageFileContainers.map(item => item.url)
      const filesToAdd = imageFileContainers.filter(item => !!item.id) as Array<ImageFileContainer>
      const urlsToDelete = song.music_sheet_urls.filter(url => !curImageUrls.includes(url))
      let urlsToKeep = song.music_sheet_urls.filter(url => curImageUrls.includes(url))
      const newDownloadUrls = await StorageService.updateMusicSheets(teamId, filesToAdd, urlsToDelete);
      if (newDownloadUrls.length > 0) {
        urlsToKeep = urlsToKeep.concat(newDownloadUrls)
      }
      const songInput = {
        ...input,
        music_sheet_urls: urlsToKeep
      }
      const promises = [];
      promises.push(SongService.updateSong(authUser?.uid, song?.id, songInput));
      promises.push(TagService.addNewTags(teamId, songInput.tags));
      await Promise.all(promises)

      setSongUpdater((prev) => prev+1)

      toast({title: "Song edited successfully."})
      setIsOpen(false)
      setIsLoading(false)
    }
    catch (e) {
      console.log(e)
    }
    finally {
      clearContents()
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  function handleRemoveImage(index: number) {
    setImageFileContainers(item =>item.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide top-0 translate-y-0 mt-[50px]" style={{ maxHeight: `${viewportHeight - 100}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode===FormMode.EDIT? "Edit Song" : "Add New Song"}</DialogTitle>
          <DialogDescription>
            {mode===FormMode.EDIT? "Edit song" : "Create and add new song in the song board"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex-center gap-2">
            {/*<TeamIcon name={team?.name || "Team"}/>*/}
            {/*<p className="font-bold text-sm">{team?.name}</p>*/}
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Title</Label>
            <Input
              id="title"
              placeholder="ex) Amazing Grace"
              value={input.title}
              onChange={(e) => setInput((prev => ({...prev, title: e.target.value})))}
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Sub Title</Label>
            <Input
              id="subtitle"
              placeholder="Sub Title..."
              value={input.subtitle}
              onChange={(e) => setInput((prev => ({...prev, subtitle: e.target.value})))}
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="ex) Isaiah6tyone"
              value={input.author}
              onChange={(e) => setInput((prev => ({...prev, author: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="version"
              value={input.version}
              onChange={(e) => setInput((prev => ({...prev, version: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              placeholder="key"
              value={input.key}
              onChange={(e) => setInput((prev => ({...prev, key: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              placeholder="https://youtube..."
              value={input.link}
              onChange={(e) => setInput((prev => ({...prev, link: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <TagMultiSelect input={input} setInput={setInput}/>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="bpm">BPM</Label>
            <Input
              id="bpm"
              type="number"
              placeholder="ex) 120"
              defaultValue={input.bpm ?? ""}
              onChange={(e) => setInput((prev => ({...prev, bpm: Number(e.target.value)})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              className="h-20"
              placeholder="Write the description"
              value={input.description}
              onChange={(e) => setInput((prev => ({...prev, description: e.target.value})))}
            />
          </div>
          <div className="w-full flex-start flex-col items-center gap-1.5">
            <Label>
              Music Sheets
            </Label>
            <div className="w-full h-14 py-2 flex-center gap-2">
              <MultipleImageUploader imageFileContainers={imageFileContainers}
                                     setImageFileContainers={setImageFileContainers} maxNum={5}>
                <div
                  className="w-full h-full bg-blue-500 rounded-lg flex-center text-white cursor-pointer hover:bg-blue-400">
                  Upload Image
                </div>
              </MultipleImageUploader>
              <PdfUploader imageFileContainers={imageFileContainers} setImageFileContainers={setImageFileContainers}
                           maxNum={5}>
                <div
                  className="w-full h-full bg-purple-700 rounded-lg flex-center text-white cursor-pointer hover:bg-purple-500">
                  Upload PDF
                </div>
              </PdfUploader>
            </div>
            <div className="flex-start w-full h-60 aspect-square border-2 p-2 rounded-md shadow-sm">
              <div className="flex w-full h-full gap-4 overflow-x-auto">
                {
                  imageFileContainers?.map((imageFileContainer, i) => (
                    <MusicSheetCard key={i} imageFileContainer={imageFileContainer} index={i}
                                    handleRemoveImage={handleRemoveImage}/>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          {
            (mode === FormMode.EDIT)
              ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
              : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
