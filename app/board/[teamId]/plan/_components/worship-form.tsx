'use client'

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useState} from "react";
import {DatePicker} from "@/app/board/[teamId]/plan/_components/date-picker";
import {NewSongCard} from "@/app/board/[teamId]/plan/_components/new-song-card";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {useToast} from "@/components/ui/use-toast";
import {AddSongButton} from "@/app/board/[teamId]/plan/_components/add-song-button";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {Song} from "@/models/song";
import {SongService, WorshipService} from "@/apis";
import {FormMode} from "@/components/constants/enums";
import {Worship} from "@/models/worship";
import {timestampToDate} from "@/components/helper/helper-functions";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/helper/routes";
import {auth} from "@/firebase";
import {worshipIdsUpdaterAtom, worshipUpdaterAtom} from "@/global-states/worship-state";

export interface WorshipInfo {
  title: string
  description: string
  date: Date
  songInfoList: Array<SongInfo>
}

export interface SongInfo {
  note: string
  song: Song
}

interface Props {
  mode: FormMode
  isOpen: boolean
  setIsOpen: Function
  worship: Worship
}

export function WorshipForm({mode, isOpen, setIsOpen, worship}: Props) {
  const authUser = auth.currentUser
  const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom)
  const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const [selectedSongInfoList, setSelectedSongInfoList] = useRecoilState(selectedSongInfoListAtom)

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT)? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT)? worship?.description ?? "" : "",
  })
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT)? timestampToDate(worship?.worship_date) : new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0);
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const songPromises = worship?.songs?.map(async (songInfo) => {
        const song = await SongService.getById(songInfo.id);
        return { song, note: songInfo.note };
      });
      if (songPromises) {
        Promise.all(songPromises).then((_songInfoList) => {
          setSelectedSongInfoList(_songInfoList as Array<SongInfo>);
        });
      }
    }
  }, [mode, setSelectedSongInfoList, worship?.songs])

  useEffect(() => {
    setViewportHeight(window?.visualViewport.height);

    const handleResize = () => {
      setViewportHeight(window?.visualViewport.height);
    };

    window?.visualViewport.addEventListener('resize', handleResize);
    return () => window?.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  function isSessionValid() {
    if (!authUser?.uid) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return false
    }
    return true
  }

  function clearContents() {
    setBasicInfo({title:"", description: ""})
    setDate(new Date())
    setIsLoading(false)
    setSelectedSongInfoList([])
  }

  function getWorshipInput() {
    const worshipInput: WorshipInfo = {...basicInfo, date, songInfoList: selectedSongInfoList,}
    return worshipInput
  }

  function handleCreate() {
    setIsLoading(true)

    if (!isSessionValid()) return false

    try {
      const worshipInput = getWorshipInput()

      WorshipService.addNewWorship(authUser?.uid, teamId, worshipInput).then((worshipId: string) => {
        toast({
          title: `New worship has set on ${date}.`,
          description: team?.name,
        })
        setIsOpen(false)
        setIsLoading(false)
        clearContents()
        setWorshipUpdater(prev => prev + 1)
        setWorshipIdsUpdater(prev => prev + 1)
        router.push(getPathWorship(teamId, worshipId))
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

    if (!isSessionValid()) return false

    try {
      const worshipInput = getWorshipInput()

      if (!worship?.id) toast({title: `There is an error with current Worship`, description: team?.name})

      await WorshipService.updateWorship(authUser?.uid, worship?.id, worshipInput);
      toast({title: `Worship successfully updated.`, description: team?.name})

      setIsOpen(false)
      setIsLoading(false)
      clearContents()
      setWorshipUpdater(prev => prev + 1)
      router.push(getPathWorship(teamId, worship?.id))
    }
    catch (e) {
      console.log("err", e)
      toast({
        title: `Something went wrong. Please try again later.`,
        description: team?.name,
      })
    }
    finally {
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen()}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide top-0 translate-y-0 mt-[50px]" style={{ maxHeight: `${viewportHeight - 100}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            { (mode === FormMode.CREATE) ? "Create new worship" : "Edit worship" }
          </DialogTitle>
          <DialogDescription>
            { (mode === FormMode.CREATE)? "Create worship and share with your team." : "Edit worship"}
          </DialogDescription>
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
              Worship Date
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
                selectedSongInfoList.map((songInfo, i) => (
                  <NewSongCard key={i} songOrder={i + 1} songInfo={songInfo}/>
                ))
              }
              <AddSongButton teamId={teamId}/>
            </div>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogFooter>
          {
            (mode === FormMode.CREATE)
              ? <Button type="submit" onClick={handleCreate}>{isLoading? "Creating..." : "Create"}</Button>
              : <Button type="submit" onClick={handleEdit}>{isLoading? "Saving..." : "Save"}</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
