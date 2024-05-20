'use client'

import {Plus} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {TagMultiSelect} from "@/app/board/[teamId]/song/_components/tag-multi-select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import {
  useRecoilRefresher_UNSTABLE,
  useRecoilState,
  useRecoilStateLoadable,
  useRecoilValue, useResetRecoilState,
  useSetRecoilState
} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {Song} from "@/models/song";
import {SongService, StorageService, TagService}  from "@/apis";
import {Mode} from "@/components/constants/enums";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {auth} from "@/firebase";
import {currentTeamSongIdsAtom} from "@/app/board/[teamId]/song/_states/song-board-states";
import {songAtom, songUpdaterAtom} from "@/global-states/song-state";

interface Props {
  mode: Mode
  isOpen: boolean
  setIsOpen: Function
  songId?: string
}
export interface SongInput {
  title: string
  author: string
  version: string
  key: string
  link: string
  tags: Array<string>
  bpm: number | null
  description: string
}
export interface MusicSheet {
  id: string;
  file: File | null;
  url: string;
  isLoading: boolean;
}

export function SongForm({mode, isOpen, setIsOpen, songId}: Props) {
  const [song, setSong] = useRecoilState(songAtom(songId))
  const setSongUpdater = useSetRecoilState(songUpdaterAtom)
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom)
  const [input, setInput] = useState<SongInput>({
    title: (mode === Mode.EDIT)? song?.title?? "" : "",
    author: (mode === Mode.EDIT)? song?.original.author?? "" : "",
    version: (mode === Mode.EDIT)? song?.version?? "" : "",
    key: (mode === Mode.EDIT)? song?.key?? "":"",
    link: (mode === Mode.EDIT)? song?.original.url?? "" : "",
    tags: (mode === Mode.EDIT)? song?.tags?? [] : [],
    bpm: (mode === Mode.EDIT)? song?.bpm?? null : null,
    description: (mode === Mode.EDIT)? song?.description?? "" : ""
  })
  const [musicSheets, setMusicSheets] = useState<Array<MusicSheet>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(window.visualViewport.height);
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const _musicSheets = song?.music_sheet_urls.map((url) => ({id: "", file: null, url: url, isLoading:false})) as Array<MusicSheet>
    if (_musicSheets)
      setMusicSheets(_musicSheets)
  }, [song?.music_sheet_urls])

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.visualViewport.height);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);


  function createValidCheck() {
    if (!authUser?.uid) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return false
    }
    return true
  }

  async function handleCreate() {
    setIsLoading(true)

    if (!createValidCheck()) return false

    try {
      const downloadUrls = await StorageService.uploadMusicSheets(teamId, musicSheets);
      const songInput = {...input, music_sheet_urls: downloadUrls}
      const promises = [];
      promises.push(SongService.addNewSong(authUser?.uid, teamId, songInput));
      promises.push(TagService.addNewTags(teamId, songInput.tags));
      const promiseResults = await Promise.all(promises)
      const songId = promiseResults[0] as string

      toast({
        title: `New Song Created!`,
        description: `${team?.name} - ${songInput.title}`,
      })

      setCurrentTeamSongIds((prev) => ([...prev, songId]))
      router.push(getPathSongDetail(teamId, songId))
    }
    catch (e) {
      console.log("err", e)
    }
    finally {
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
      const curImageUrls = musicSheets.map(item => item.url)
      const filesToAdd = musicSheets.filter(item => !!item.id) as Array<MusicSheet>
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
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  function handleRemoveImage(index: number) {
    setMusicSheets(item =>item.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide top-0 translate-y-0 mt-[50px]" style={{ maxHeight: `${viewportHeight - 100}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode===Mode.EDIT? "Edit Song" : "Add New Song"}</DialogTitle>
          <DialogDescription>
            {mode===Mode.EDIT? "Edit song" : "Create and add new song in the song board"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex-center gap-2">
            <TeamIcon name={team?.name || "Team"}/>
            <p className="font-bold text-sm">{team?.name}</p>
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
          <div className="flex-start flex-col items-center gap-1.5">
            <Label>
              Music Sheets
            </Label>
            <div className="flex-start w-full h-60 aspect-square border-2 p-2 rounded-md shadow-sm">
              <MultipleImageUploader musicSheets={musicSheets} setMusicSheets={setMusicSheets} maxNum={5}>
                <div className="h-full flex-center flex-col p-6">
                  <Plus
                    className="h-[50px] w-[50px] rounded-full p-2 text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"/>
                </div>
              </MultipleImageUploader>
              <div className="flex w-full h-full gap-4 overflow-x-auto">
                {
                  musicSheets?.map((musicSheet, i) => (
                    <MusicSheetCard key={i} musicSheet={musicSheet} index={i} handleRemoveImage={handleRemoveImage}/>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          {
            (mode === Mode.EDIT)
              ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
              : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
