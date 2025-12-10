import { auth } from "@/firebase";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { worshipIdsUpdaterAtom, worshipUpdaterAtom } from "@/global-states/worship-state";
import { teamAtom } from "@/global-states/teamState";
import React, { useCallback, useEffect, useState } from "react";
import { FormMode, WorshipSpecialOrderType } from "@/components/constants/enums";
import { timestampToDate } from "@/components/util/helper/helper-functions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { WorshipService } from "@/apis";
import { getPathPlan, getPathWorship } from "@/components/util/helper/routes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Worship } from "@/models/worship";
import { WorshipInput } from "@/components/constants/types";
import { format, nextFriday, nextSunday } from 'date-fns';
import {
  selectedWorshipSongHeaderListAtom,
  worshipBeginningSongHeaderAtom,
  worshipEndingSongHeaderAtom
} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import { WorshipDatePicker } from "@/components/elements/design/worship/worship-form/worship-date-picker";
import {
  AddedSongHeaderStatic
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-static";
import {
  AddedSongHeaderDefault
} from "@/components/elements/design/song/song-header/worship-form/added-song-header-default";
import { AddSongButton } from "@/components/elements/design/worship/worship-form/add-song-button";
import {
  AddWorshipSongDialogTrigger
} from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog-trigger";
import { BaseForm } from "@/components/elements/util/form/base-form";
import { LinkIcon, CalendarIcon, Music } from "lucide-react";
import PushNotificationService from "@/apis/PushNotificationService";
import { Separator } from "@/components/ui/separator";
import { Bell, LogOut, Mail, MailIcon, Settings, Users } from 'lucide-react';
import { currentTeamIdAtom } from "@/global-states/teamState";
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state";
import { TeamIcon } from "@/components/elements/design/team/team-icon";
import { ManageTeamDialog } from "@/components/elements/dialog/manage-team/manage-team-dialog";
import { MenuItem } from "@/app/board/[teamId]/(manage)/manage/_components/menu-item";
import { accountSettingAtom } from "@/global-states/account-setting";

interface Props {
  mode: FormMode
  teamId: string
  worship: Worship
}

export function WorshipForm({ mode, teamId, worship }: Props) {
  const authUser = auth.currentUser
  const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom)
  const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const [beginningSongHeader, setBeginningSongHeader] = useRecoilState(worshipBeginningSongHeaderAtom)
  const [endingSongHeader, setEndingSongHeader] = useRecoilState(worshipEndingSongHeaderAtom)

  const [basicInfo, setBasicInfo] = useState({
    title: (mode === FormMode.EDIT) ? worship?.title ?? "" : "",
    description: (mode === FormMode.EDIT) ? worship?.description ?? "" : "",
    link: (mode === FormMode.EDIT) ? worship?.link ?? "" : "",
  })
  const [date, setDate] = useState<Date>((mode === FormMode.EDIT) ? timestampToDate(worship?.worship_date) : new Date())
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
    setBeginningSongHeader({ id: "", note: "", selected_music_sheet_ids: [] })
    setEndingSongHeader({ id: "", note: "", selected_music_sheet_ids: [] })
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
      router.push(getPathPlan(teamId) + "?expanded=" + worshipId)
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

      if (!worship?.id) toast({ title: `There is an error with current Worship`, description: team?.name })

      await WorshipService.updateWorship(authUser?.uid, worship?.id, worshipInput);
      toast({ title: `Worship successfully updated.`, description: team?.name })

      setIsLoading(false)
      clearContents()
      setWorshipUpdater(prev => prev + 1)
      router.push(getPathPlan(teamId) + "?expanded=" + worship?.id)
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
    <BaseForm title="" description="">
      <div className="w-full max-w-4xl mx-auto min-h-[800px] py-8">
        {/* Floating Save Action */}
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={mode === FormMode.CREATE ? handleCreate : handleEdit}
            disabled={isLoading}
            className="rounded-full h-14 px-8 bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all font-semibold text-lg"
          >
            {isLoading ? "Saving..." : (mode === FormMode.CREATE ? "Create Plan" : "Save Changes")}
          </Button>
        </div>

        <div className="space-y-8">
          {/* 1. Header Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                id="title"
                placeholder="Service Title..."
                value={basicInfo.title}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                className="text-4xl sm:text-5xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-200 text-gray-900 h-auto py-2 bg-transparent leading-tight w-full"
              />

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setBasicInfo(prev => ({ ...prev, title: `금요 예배` })); setDate(upcomingFriday); }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  금요 예배
                </button>
                <button
                  type="button"
                  onClick={() => { setBasicInfo(prev => ({ ...prev, title: `주일 예배` })); setDate(upcomingSunday); }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  주일 예배
                </button>
                <button
                  type="button"
                  onClick={() => { setBasicInfo(prev => ({ ...prev, title: `${formattedUpcomingFriday} 금요 예배` })); setDate(upcomingFriday); }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {`${formattedUpcomingFriday} 금요 예배`}
                </button>
                <button
                  type="button"
                  onClick={() => { setBasicInfo(prev => ({ ...prev, title: `${formattedUpcomingSunday} 주일 예배` })); setDate(upcomingSunday); }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {`${formattedUpcomingSunday} 주일 예배`}
                </button>
              </div>
            </div>

            {/* Meta Row (Date, Link, Team) */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              {/* Date */}
              <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <CalendarIcon className="w-4 h-4" />
                <div className="min-w-[100px]">
                  <WorshipDatePicker date={date} setDate={setDate} />
                </div>
              </div>

              {/* Link */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 px-3 py-1.5 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Add a link (e.g. YouTube, Drive)..."
                  value={basicInfo.link}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, link: e.target.value }))}
                  className="bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Team (Read Only) */}
              <div className="flex items-center gap-2 text-gray-400 px-2 select-none">
                <Users className="w-4 h-4" />
                <span className="font-medium">{team?.name}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-100" />

          {/* 2. Description */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider block ml-1">Context</Label>
            <Textarea
              className="min-h-[100px] bg-gray-50/50 resize-y border-none shadow-sm rounded-xl p-4 text-gray-600 text-base leading-relaxed placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-gray-200"
              placeholder="Add notes, sermon topic, or details..."
              value={basicInfo.description}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <Separator className="bg-gray-100" />

          {/* 3. Song List (Setlist) */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-gray-900" />
                <span className="text-xl font-bold text-gray-900">Setlist</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">{selectedWorshipSongHeaderList.length}</span>
              </div>
              {/* Optional: Add button here too? */}
            </div>

            <div className="space-y-3 pl-0 sm:pl-4 border-l-2 border-gray-100/50">
              {beginningSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.BEGINNING} songHeader={beginningSongHeader} />}

              {selectedWorshipSongHeaderList.map((songHeader, i) => (
                <AddedSongHeaderDefault key={i} teamId={teamId} songOrder={i + 1} songHeader={songHeader} />
              ))}

              {endingSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.ENDING} songHeader={endingSongHeader} />}

              <div className="pt-2">
                <AddWorshipSongDialogTrigger teamId={teamId}>
                  <AddSongButton />
                </AddWorshipSongDialogTrigger>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseForm>
  )
}
