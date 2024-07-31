import {auth} from "@/firebase";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {worshipIdsUpdaterAtom, worshipUpdaterAtom} from "@/global-states/worship-state";
import {teamAtom} from "@/global-states/teamState";
import {
  selectedWorshipSongWrapperListAtom,
  worshipBeginningSongWrapperAtom,
  worshipEndingSongWrapperAtom
} from "@/app/board/[teamId]/plan/_components/status";
import {useCallback, useEffect, useState} from "react";
import {FormMode, WorshipSpecialOrderType} from "@/components/constants/enums";
import {timestampToDate} from "@/components/helper/helper-functions";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import {SongService, WorshipService} from "@/apis";
import {getPathWorship} from "@/components/helper/routes";
import {TeamIcon} from "@/components/team-icon";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {DatePicker} from "@/app/board/[teamId]/plan/_components/date-picker";
import {Textarea} from "@/components/ui/textarea";
import {NewSongCard} from "@/app/board/[teamId]/plan/_components/new-song-card";
import {AddSongButton} from "@/app/board/[teamId]/plan/_components/add-song-button";
import {Button} from "@/components/ui/button";
import {Song} from "@/models/song";
import {Worship} from "@/models/worship";
import {StaticSongCard} from "@/app/board/[teamId]/plan/_components/static-song-card";
import {WorshipPlan, WorshipSongWrapper} from "@/components/constants/types";
import {WorshipSongPreviewItem} from "@/app/worship/[teamId]/[worshipId]/_components/worship-song-preview-item";
import {
  SelectSongDetailCardWrapper
} from "@/app/worship/[teamId]/[worshipId]/_components/select-song-detail-card-wrapper";


export type WorshipInput = WorshipPlan

interface Props {
  mode: FormMode
  teamId: string
  worship: Worship
}

export function WorshipPlanForm({mode, teamId, worship}: Props) {
  const authUser = auth.currentUser
  const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom)
  const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const [selectedWorshipSongWrapperList, setSelectedWorshipSongWrapperList] = useRecoilState(selectedWorshipSongWrapperListAtom)
  const [beginningSongWrapper, setBeginningSongWrapper] = useRecoilState(worshipBeginningSongWrapperAtom)
  const [endingSongWrapper, setEndingSongWrapper] = useRecoilState(worshipEndingSongWrapperAtom)

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT)? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT)? worship?.description ?? "" : "",
  })
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT)? timestampToDate(worship?.worship_date) : new Date())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const clearContents = useCallback(() => {
    setIsLoading(false)
    // todo: check if this called first
    setSelectedWorshipSongWrapperList([])
    setBeginningSongWrapper({id: "", key: ""})
    setEndingSongWrapper({id: "", key: ""})
  }, [setBeginningSongWrapper, setEndingSongWrapper, setSelectedWorshipSongWrapperList])


  useEffect(() => {
    return () => clearContents()
  }, [clearContents]);

  /* Initialize selected songs */
  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const songPromises = worship?.songs?.map(async (songInfo) => {
        const song = await SongService.getById(songInfo.id);
        return { song, note: songInfo.note };
      });
      if (songPromises) {
        Promise.all(songPromises).then((_songInfoList) => {
          setSelectedWorshipSongWrapperList(_songInfoList as Array<WorshipSongWrapper>);
        });
      }
    }
  }, [mode, setSelectedWorshipSongWrapperList, worship?.songs])

  /* Initialize beginning and ending song*/
  useEffect(() => {
    if (mode === FormMode.CREATE) {
      const option = team?.option?.worship
      if (option) {
        setBeginningSongWrapper({
          id: option.beginning_song.id,
          key: option.beginning_song.key
        })
        setEndingSongWrapper({
          id: option.ending_song.id,
          key: option.ending_song.key
        })
      }
    }

    if (mode === FormMode.EDIT) {
      if (worship?.beginning_song?.id) {
        setBeginningSongWrapper({
          id: worship?.beginning_song?.id,
          key: worship?.beginning_song?.key,
        })
      }
      if (worship?.ending_song?.id) {
        setEndingSongWrapper({
          id: worship?.ending_song?.id,
          key: worship?.ending_song?.key,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, setBeginningSongWrapper, setEndingSongWrapper])

  function isSessionValid() {
    if (!authUser?.uid) {
      console.log("error");
      setIsLoading(false)
      return false
    }
    return true
  }

  function getWorshipInput() {
    const worshipInput: WorshipInput = {
      title: basicInfo.title,
      description: basicInfo.description,
      date: date,
      worshipSongWrappers: selectedWorshipSongWrapperList,
      beginningSong: beginningSongWrapper,
      endingSong: endingSongWrapper,
    }
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
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-full sm:max-w-3xl overflow-y-scrol scrollbar-hide">
        <div className="w-full">
          <div className="text-2xl font-semibold">
            { (mode === FormMode.CREATE) ? "Create new worship" : "Edit worship" }
          </div>
          <div className="text-gray-500">
            { (mode === FormMode.CREATE)? "Create worship and share with your team." : "Edit worship"}
          </div>
        </div>
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
                beginningSongWrapper?.id &&
                <StaticSongCard teamId={teamId} specialOrderType={WorshipSpecialOrderType.BEGINNING} songWrapper={beginningSongWrapper}/>
              }
              {
                selectedWorshipSongWrapperList.map((songWrapper, i) => (
                  <NewSongCard key={i} teamId={teamId} songOrder={i + 1} songWrapper={songWrapper}/>
                ))
              }
              {
                endingSongWrapper?.id &&
                <StaticSongCard teamId={teamId} specialOrderType={WorshipSpecialOrderType.ENDING} songWrapper={endingSongWrapper}/>
              }
              <AddSongButton teamId={teamId}/>
            </div>
          </div>
        </div>
        <div className="w-full flex-end py-10">
          <div>
            {
              (mode === FormMode.CREATE)
                ? <Button type="submit" onClick={handleCreate}>{isLoading? "Creating..." : "Create"}</Button>
                : <Button type="submit" onClick={handleEdit}>{isLoading? "Saving..." : "Save"}</Button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
