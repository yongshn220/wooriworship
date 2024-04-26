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
import {Textarea} from "@/components/ui/textarea";
import {useState} from "react";
import {DatePicker} from "@/app/board/_components/worship-plan/date-picker";
import {NewSongCard} from "@/app/board/_components/worship-plan/new-song-card";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {useSession} from "next-auth/react";
import {WorshipService} from "@/apis";
import {useToast} from "@/components/ui/use-toast";
import {AddSongButton} from "@/app/board/_components/worship-plan/add-song-button";
import {selectedSongListAtom} from "@/app/board/_components/worship-plan/status";

export interface WorshipInfo {
  title: string
  description: string
}

export interface SongInfo {
  note: string
  id: string | null
}

export function NewButton() {
  const {data: session} = useSession()
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtomById(teamId))
  const selectedSongList = useRecoilValue(selectedSongListAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
  })
  const [date, setDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()


  function handleCreate() {
    setIsLoading(true)

    if (!session?.user.id) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return;
    }

    try {
      const worshipInput = {
        ...basicInfo,
        date,
        selectedSongList,
      }

      console.log(worshipInput)
      // @TODO: WorshipService
      // WorshipService.addNewWorship(session?.user.id, teamId, worshipInput).then(() => {
      //   toast({
      //     title: `New worship has set on ${date}.`,
      //     description: team?.name,
      //   })
      //   setIsOpen(false)
      //   setIsLoading(false)
      // })
       
    }
    catch (e) {
      console.log("err", e)
    }
    finally {
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="group aspect-[1/1] border rounded-lg flex-center flex-col overflow-hidden bg-blue-500 hover:bg-blue-600 cursor-pointer">
          <Plus className="h-12 w-12 text-white stroke-1"/>
          <p className="text-sm text-white">New board</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create new worship</DialogTitle>
          <DialogDescription>Create worship and share with your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex-center gap-2">
            <TeamIcon name="GVC Friday"/>
            <p className="font-bold text-sm">{team?.name}</p>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="title">
              Title
            </Label>
            <Input
              id="name"
              className=""
              placeholder="Title of worship"
              value={basicInfo.title}
              onChange={(e) => setBasicInfo((prev => ({...prev, title: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="date">
              Date
            </Label>
            <DatePicker date={date} setDate={setDate}/>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              className="h-40"
              placeholder="Write the description"
              value={basicInfo.description}
              onChange={(e) => setBasicInfo((prev => ({...prev, description: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="songs">
              Songs
            </Label>
            <div className="flex-center w-full flex-col gap-8">
              {
                selectedSongList.map((songInfo, i) => (
                  <NewSongCard key={i} index={i+1} songInfo={songInfo}/>
                ))
              }
              <AddSongButton/>
            </div>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>{isLoading? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
