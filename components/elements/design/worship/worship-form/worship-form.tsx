import {auth} from "@/firebase";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {worshipIdsUpdaterAtom, worshipUpdaterAtom} from "@/global-states/worship-state";
import {teamAtom} from "@/global-states/teamState";
import React, {useCallback, useEffect, useState} from "react";
import {FormMode, WorshipSpecialOrderType} from "@/components/constants/enums";
import {timestampToDate} from "@/components/util/helper/helper-functions";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import {WorshipService} from "@/apis";
import {getPathWorship} from "@/components/util/helper/routes";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Worship} from "@/models/worship";
import {WorshipInput} from "@/components/constants/types";
import {format, nextFriday, nextSunday} from 'date-fns';
import {
  selectedWorshipSongHeaderListAtom,
  worshipBeginningSongHeaderAtom,
  worshipEndingSongHeaderAtom
} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import {WorshipDatePicker} from "@/components/elements/design/worship/worship-form/worship-date-picker";
import {
  AddedSongHeaderStatic
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-static";
import {
  AddedSongHeaderDefault
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import {AddSongButton} from "@/components/elements/design/worship/worship-form/add-song-button";
import {
  AddWorshipSongDialogTrigger
} from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog-trigger";
import {BaseForm} from "@/components/elements/util/form/base-form";
import {LinkIcon} from "lucide-react";
import PushNotificationService from "@/apis/PushNotificationService";
import {Separator} from "@/components/ui/separator";
import {Bell, LogOut, Mail, MailIcon, Settings, Users} from 'lucide-react';
import {currentTeamIdAtom} from "@/global-states/teamState";
import {invitationInboxDialogOpenStateAtom} from "@/global-states/dialog-state";
import {TeamIcon} from "@/components/elements/design/team/team-icon";
import {ManageTeamDialog} from "@/components/elements/dialog/manage-team/manage-team-dialog";
import {MenuItem} from "@/app/board/[teamId]/(manage)/manage/_components/menu-item";
import {accountSettingAtom} from "@/global-states/account-setting";

interface Props {
  mode: FormMode
  teamId: string
  worship: Worship
}

export function WorshipForm({mode, teamId, worship}: Props) {
  const authUser = auth.currentUser
  const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom)
  const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const [beginningSongHeader, setBeginningSongHeader] = useRecoilState(worshipBeginningSongHeaderAtom)
  const [endingSongHeader, setEndingSongHeader] = useRecoilState(worshipEndingSongHeaderAtom)

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT)? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT)? worship?.description ?? "" : "",
    link: (mode === FormMode.EDIT)? worship?.link ?? "" : "",
  })
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT)? timestampToDate(worship?.worship_date) : new Date())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const upcomingFriday = nextFriday(new Date());
  const upcomingSunday = nextSunday(new Date());
  const formattedUpcomingFriday = format(upcomingFriday, 'yyyy-MM-dd');
  const formattedUpcomingSunday = format(upcomingSunday, 'yyyy-MM-dd');

  const clearContents = useCallback(() => {
    setIsLoading(false)
    // todo: check if this called first
    setSelectedWorshipSongHeaderList([])
    setBeginningSongHeader({id: "", note: "", selected_music_sheet_ids: []})
    setEndingSongHeader({id: "", note: "", selected_music_sheet_ids: []})
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

  /* Initialize beginning and ending song-board*/
  useEffect(() => {
    if (mode === FormMode.CREATE) {
      const option = team?.option?.worship
      if (option) {
        setBeginningSongHeader({
          id: option.beginning_song?.id,
          note: option.beginning_song?.note,
          selected_music_sheet_ids: option.beginning_song?.selected_music_sheet_ids
        })
        setEndingSongHeader({
          id: option.ending_song?.id,
          note: option.ending_song?.note,
          selected_music_sheet_ids: option.ending_song?.selected_music_sheet_ids
        })
      }
    }

    if (mode === FormMode.EDIT) {
      if (worship?.beginning_song?.id) {
        setBeginningSongHeader({
          id: worship?.beginning_song?.id,
          note: worship?.beginning_song?.note,
          selected_music_sheet_ids: worship?.beginning_song?.selected_music_sheet_ids
        })
      }
      if (worship?.ending_song?.id) {
        setEndingSongHeader({
          id: worship?.ending_song?.id,
          note: worship?.ending_song?.note,
          selected_music_sheet_ids: worship?.ending_song?.selected_music_sheet_ids
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, setBeginningSongHeader, setEndingSongHeader])

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
      link: basicInfo.link,
      date: date,
      worshipSongHeaders: selectedWorshipSongHeaderList,
      beginningSong: beginningSongHeader,
      endingSong: endingSongHeader,
    }
    return worshipInput
  }

  async function handleCreate() {
    setIsLoading(true)

    if (!isSessionValid()) return false

    try {
      const worshipInput = getWorshipInput()

      const worshipId = await WorshipService.addNewWorship(authUser?.uid, teamId, worshipInput);
      
      // Send notifications to team members
      await PushNotificationService.notifyTeamNewWorship(
        teamId,
        authUser?.uid,
        worshipInput.date,
        worshipInput.title
      );

      toast({
        title: `New worship has set on ${date}.`,
        description: team?.name,
      })
      setIsLoading(false)
      clearContents()
      setWorshipUpdater(prev => prev + 1)
      setWorshipIdsUpdater(prev => prev + 1)
      router.push(getPathWorship(teamId, worshipId))
    }
    catch (e) {
      console.log("err", e)
      toast({
        title: "Failed to create worship",
        description: "Please try again",
        variant: "destructive"
      })
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
    <BaseForm title={(mode === FormMode.CREATE) ? "Add New Worship" : "Edit Worship"} description="Enter the details of your worship below">
      <div className="grid gap-6 py-4">
        <div className="flex-start flex-col items-center gap-1.5">
          <Label htmlFor="title">
            Title
          </Label>
          <Input
            id="name"
            className="bg-white"
            placeholder="Title of worship"
            value={basicInfo.title}
            onChange={(e) => setBasicInfo((prev => ({...prev, title: e.target.value})))}
          />
          <div className="space-x-2 space-y-2">
            <Button variant="outline" onClick={() => {
              setBasicInfo(prev => ({...prev, title: `금요 예배`}))
              setDate(upcomingFriday);
            }}>
              {`금요 예배`}
            </Button>
            <Button variant="outline" onClick={() => {
              setDate(upcomingSunday);
              setBasicInfo(prev => ({...prev, title: `주일 예배`}))
            }}>
              {`주일 예배`}
            </Button>
            <Button variant="outline" onClick={() => {
              setBasicInfo(prev => ({...prev, title: `${formattedUpcomingFriday} 금요 예배`}));
              setDate(upcomingFriday);
            }}>
              {`${formattedUpcomingFriday} 금요 예배`}
            </Button>
            <Button variant="outline" onClick={() => {
              setBasicInfo(prev => ({...prev, title: `${formattedUpcomingSunday} 주일 예배`}));
              setDate(upcomingSunday);
            }}>
              {`${formattedUpcomingSunday} 주일 예배`}
            </Button>
          </div>
        </div>
        <div className="flex-start flex-col items-center gap-1.5">
          <Label htmlFor="date">
            Worship Date
          </Label>
          <WorshipDatePicker date={date} setDate={setDate}/>
        </div>
        <div className="flex-start flex-col items-center gap-1.5">
          <Label htmlFor="title">
            Link
          </Label>
          <div className="w-full relative">
            <Input
              id="link"
              placeholder="https://..."
              value={basicInfo.link}
              onChange={(e) => setBasicInfo((prev => ({...prev, link: e.target.value})))}
              className="w-full pl-9"
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex-start flex-col items-center gap-1.5">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            className="h-40 bg-white"
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
              beginningSongHeader?.id &&
              <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.BEGINNING} songHeader={beginningSongHeader}/>
            }
            {
              selectedWorshipSongHeaderList.map((songHeader, i) => (
                <AddedSongHeaderDefault key={i} teamId={teamId} songOrder={i + 1} songHeader={songHeader}/>
              ))
            }
            {
              endingSongHeader?.id &&
              <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.ENDING} songHeader={endingSongHeader}/>
            }
            <AddWorshipSongDialogTrigger teamId={teamId}>
              <AddSongButton/>
            </AddWorshipSongDialogTrigger>
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
    </BaseForm>
  )
}
