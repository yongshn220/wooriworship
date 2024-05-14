'use client'

import {Plus} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {TagMultiSelect} from "@/app/board/[teamId]/song/_components/tag-multi-select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {Song} from "@/models/song";
import {SongService, StorageService, TagService}  from "@/apis";
import {Mode} from "@/components/constants/enums";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {auth} from "@/firebase";

interface Props {
  mode: Mode
  isOpen: boolean
  setIsOpen: Function
  song: Song | null
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

export function SongForm({mode, isOpen, setIsOpen, song}: Props) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtomById(teamId))
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
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const _musicSheets = song?.music_sheet_urls.map((url) => ({id: "", file: null, url: url, isLoading:false})) as Array<MusicSheet>
    if (_musicSheets)
      setMusicSheets(_musicSheets)
  }, [song?.music_sheet_urls])

  async function handleCreate() {
    setIsLoading(true)

    if (!authUser?.uid) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return;
    }

    try {
      const downloadUrls = await StorageService.uploadMusicSheets(teamId, musicSheets);
      const songInput = {
        ...input,
        music_sheet_urls: downloadUrls
      }
      const promises = [];
      promises.push(SongService.addNewSong(authUser?.uid, teamId, songInput));
      promises.push(TagService.addNewTags(teamId, songInput.tags));
      Promise.all(promises).then(results => {
        const songId = results[0] as string

        toast({
          title: `New Song Created!`,
          description: `${team?.name} - ${songInput.title}`,
        })

        router.push(getPathSongDetail(teamId, songId))
      })
    }
    catch (e) {
      console.log("err", e)
    }
    finally {
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  async function handleEdit() {
    setIsLoading(true)

    if (!authUser?.uid|| (song == null || song.id == null)) {
      setIsOpen(false)
      setIsLoading(false)
      return;
    }

    try {
      const curImageUrls = musicSheets.map(item => item.url)
      const filesToAdd = musicSheets.filter(url => !!url) as Array<MusicSheet>
      const urlsToDelete = song.music_sheet_urls.filter(url => !curImageUrls.includes(url))
      const urlsToKeep = song.music_sheet_urls.filter(url => curImageUrls.includes(url))

      const newDownloadUrls = await StorageService.updateMusicSheets(teamId, filesToAdd, urlsToDelete);
      const songInput = {
        ...input,
        music_sheet_urls: urlsToKeep.concat(newDownloadUrls)
      }

      const promises = [];
      promises.push(SongService.updateSong(authUser?.uid, song?.id, songInput));
      promises.push(TagService.addNewTags(teamId, songInput.tags));
      await Promise.all(promises)
    }
    catch (e) {
      console.log("err", e)
    }
    finally {
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  function handleRemoveImage(index: number) {
    setMusicSheets(item =>item.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
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
              defaultValue={input.bpm?? ""}
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
