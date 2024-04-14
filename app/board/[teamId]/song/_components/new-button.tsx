'use client'

import {Plus} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {TagMultiSelect} from "@/app/board/[teamId]/song/_components/tag-multi-select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import SongService from "@/apis/SongService";
import StorageService from "@/apis/StorageService";
import {useSession} from "next-auth/react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";

export interface SongInput {
  title: string
  author: string
  version: string
  link: string
  tags: Array<string>
  bpm: number | null
  description: string
}
export interface MusicSheet {
  id: string;
  file: File;
  url: string;
  isLoading: boolean;
}
export function NewButton() {
  const {data: session} = useSession()
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtomById(currentTeamId))
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState<SongInput>({
    title: "",
    author: "",
    version: "",
    link: "",
    tags: [],
    bpm: null,
    description: ""
  })
  const [musicSheets, setMusicSheets] = useState<Array<MusicSheet>>([])
  const [isLoading, setIsLoading] = useState(false)

  function handleUpload() {
    setIsLoading(true)

    if (!session?.user.id) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return;
    }
    
    try {
      console.log(musicSheets);
      StorageService.uploadFile(currentTeamId, musicSheets[0].file?.name, musicSheets[0].file);
    } catch (e) {
      console.log("err", e)
    }
  }

  function handleCreate() {
    setIsLoading(true)

    if (!session?.user.id) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return;
    }

    try {
      const songInput = {
        ...input,
        files: musicSheets.map((musicSheet) => musicSheet.file)
      }

      SongService.addNewSong(session?.user.id, currentTeamId, songInput).then(() => {
        toast({
          title: "New song has been added.",
          description: team?.name,
        })
        setIsOpen(false)
        setIsLoading(false)
      })
    }
    catch (e) {
      console.log("err", e)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          Add Song
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Song</DialogTitle>
          <DialogDescription>Create and add new song in the song board</DialogDescription>
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
              className="h-40"
              placeholder="Write the description"
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
              <div className="flex w-full h-full gap-4 overflow-x-scroll">
                {
                  musicSheets.map((musicSheet, id) => (
                    <MusicSheetCard key={id} musicSheet={musicSheet} index={id}/>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>{isLoading? "Creating..." : "Create"}</Button>
          <Button type="submit" onClick={handleUpload}>{isLoading? "Uploading File..." : "Upload file"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
