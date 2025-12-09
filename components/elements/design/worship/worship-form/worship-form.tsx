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
import { getPathWorship } from "@/components/util/helper/routes";
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
import { LinkIcon } from "lucide-react";
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

      if (!worship?.id) toast({ title: `There is an error with current Worship`, description: team?.name })

      await WorshipService.updateWorship(authUser?.uid, worship?.id, worshipInput);
      toast({ title: `Worship successfully updated.`, description: team?.name })

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
    <BaseForm title="" description="">
      <div className="w-full max-w-5xl mx-auto min-h-[800px]">
        {/* 1. Header Actions */}
        <div className="flex justify-between items-start mb-10 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === FormMode.CREATE ? "New Service Plan" : "Edit Service Plan"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Organize your worship flow and setlist.</p>
          </div>
          <div>
            <Button
              onClick={mode === FormMode.CREATE ? handleCreate : handleEdit}
              disabled={isLoading}
              className="bg-gray-900 hover:bg-black text-white min-w-[120px] shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? "Saving..." : (mode === FormMode.CREATE ? "Create Plan" : "Save Changes")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 2. Main Content (Left: Title, Chips, Desc, Songs) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title Section */}
            <div className="space-y-4">
              <Input
                id="title"
                placeholder="Service Title (e.g. Sunday Worship)"
                value={basicInfo.title}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                className="text-4xl sm:text-5xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-200 text-gray-900 h-auto py-2 bg-transparent leading-tight"
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

            {/* Description */}
            <div className="group">
              <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Description</Label>
              <Textarea
                className="min-h-[120px] bg-transparent resize-none border-none shadow-none p-0 text-gray-600 text-base leading-relaxed placeholder:text-gray-300 focus-visible:ring-0"
                placeholder="Add notes, sermon topic, or details..."
                value={basicInfo.description}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <Separator className="bg-gray-100" />

            {/* Songs / Setlist */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">Setlist</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{selectedWorshipSongHeaderList.length} songs</span>
              </div>

              <div className="space-y-4">
                {beginningSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.BEGINNING} songHeader={beginningSongHeader} />}

                {selectedWorshipSongHeaderList.map((songHeader, i) => (
                  <AddedSongHeaderDefault key={i} teamId={teamId} songOrder={i + 1} songHeader={songHeader} />
                ))}

                {endingSongHeader?.id && <AddedSongHeaderStatic teamId={teamId} specialOrderType={WorshipSpecialOrderType.ENDING} songHeader={endingSongHeader} />}

                <AddWorshipSongDialogTrigger teamId={teamId}>
                  <AddSongButton />
                </AddWorshipSongDialogTrigger>
              </div>
            </div>
          </div>

          {/* 3. Sidebar (Right: Date, Link, Meta) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/80 sticky top-10 space-y-6">
              <div>
                <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 block">Date</Label>
                <div className="bg-white rounded-md shadow-sm">
                  <WorshipDatePicker date={date} setDate={setDate} />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 block">Link</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="link"
                    placeholder="https://..."
                    value={basicInfo.link}
                    onChange={(e) => setBasicInfo((prev => ({ ...prev, link: e.target.value })))}
                    className="w-full pl-9 bg-white border-gray-200 focus-visible:ring-gray-200"
                  />
                </div>
              </div>

              {/* Team Info */}
              <div>
                <Label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 block">Team</Label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{team?.name}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </BaseForm>
  )
}
