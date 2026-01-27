"use client"

import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { WorshipSpecialOrderType } from "@/components/constants/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { teamAtom } from "@/global-states/teamState";
import { TeamOption } from "@/models/team";
import { TeamService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { songAtom } from "@/global-states/song-state";
import { SetlistSongHeader } from "@/models/setlist";
import { AddableSongDetailDialogTrigger } from "@/components/elements/design/song/song-detail-card/worship-form/addable-song-detail-dialog-trigger";
import { AddedSongInnerHeader } from "@/components/elements/design/song/song-header/worship-form/parts/added-song-inner-header";

interface Props {
  teamId: string
  specialOrderType: WorshipSpecialOrderType
  songHeader: SetlistSongHeader
  onUpdate: (header: SetlistSongHeader) => void
  onRemove: () => void
}

type CheckState = boolean | "indeterminate"

export function AddedSongHeaderStatic({ teamId, specialOrderType, songHeader, onUpdate, onRemove }: Props) {
  const songLoadable = useRecoilValueLoadable(songAtom({ teamId, songId: songHeader?.id }))
  // Utilize Loadable for teamAtom to prevent Suspense
  const teamLoadable = useRecoilValueLoadable(teamAtom(teamId))
  const setTeam = useSetRecoilState(teamAtom(teamId))
  const [isDefaultChecked, setDefaultChecked] = useState<CheckState>(false)

  useEffect(() => {
    const option = teamLoadable.state === 'hasValue' ? teamLoadable.contents?.option?.worship : null
    if (!option) return

    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      if (option?.beginning_song?.id && option?.beginning_song?.id === songHeader?.id) {
        let checked = true
        for (const optionId of option.beginning_song?.selected_music_sheet_ids) {
          if (songHeader?.selected_music_sheet_ids.includes(optionId) === false) {
            checked = false; break
          }
        }
        setDefaultChecked(checked)
      }
    }
    else {
      if (option?.ending_song?.id && option?.ending_song?.id === songHeader?.id) {
        let checked = true
        for (const optionId of option.ending_song?.selected_music_sheet_ids) {
          if (songHeader?.selected_music_sheet_ids.includes(optionId) === false) {
            checked = false; break
          }
        }
        setDefaultChecked(checked)
      }
    }
  }, [songHeader?.id, songHeader?.selected_music_sheet_ids, specialOrderType, teamLoadable.state, teamLoadable.contents])

  if (songLoadable.state === 'loading' || teamLoadable.state === 'loading') {
    return <Skeleton className="w-full h-[100px] rounded-md" />
  }

  // Handle error case
  if (songLoadable.state === 'hasError' || !songLoadable.contents) {
    return <div className="text-red-500 border p-2 rounded">Error loading static song.</div>
  }

  const song = songLoadable.contents
  const team = teamLoadable.contents

  function handleRemoveSong() {
    onRemove();
  }

  function handleCheckStateChange(state: CheckState) {
    if (state === "indeterminate") state = false

    setStaticSongAsDefaultOption(state as boolean).then((isSuccess) => {
      if (isSuccess) {
        setDefaultChecked(state)
      }
    })
  }

  async function setStaticSongAsDefaultOption(state: boolean) {
    try {
      let teamOption: TeamOption = JSON.parse(JSON.stringify(team?.option))

      if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
        teamOption.worship.beginning_song = (state)
          ? { id: songHeader?.id, note: songHeader?.note, selected_music_sheet_ids: songHeader?.selected_music_sheet_ids }
          : { id: null, note: "", selected_music_sheet_ids: [] }
      }
      else {
        teamOption.worship.ending_song = (state)
          ? { id: songHeader?.id, note: songHeader?.note, selected_music_sheet_ids: songHeader?.selected_music_sheet_ids }
          : { id: null, note: "", selected_music_sheet_ids: [] }
      }

      if (await TeamService.updateTeamOption(teamId, teamOption) === false) {
        /* On Error */
        console.log("err:setStaticSongAsDefaultOption")
        toast({
          title: "Fail to set default Beginning/Ending song-board. Please try again"
        })
        return false
      }

      /* On Success */
      setTeam((prev) => ({ ...prev, option: teamOption }))
      if (state) {
        toast({
          title: `Default ${(specialOrderType === WorshipSpecialOrderType.BEGINNING) ? "Beginning" : "Ending"} song updated`,
          description: `Now "${song?.title}" will be used as ${(specialOrderType === WorshipSpecialOrderType.BEGINNING) ? "Beginning" : "Ending"} song for the future worship plan.`
        })
      }
      else {
        toast({
          title: `Default ${(specialOrderType === WorshipSpecialOrderType.BEGINNING) ? "Beginning" : "Ending"} song canceled`,
        })
      }
      return true
    }
    catch (e) {
      console.log("err:setStaticSongAsDefaultOption", e)
      toast({
        title: "Fail to set default Beginning/Ending song-board. Please try again"
      })
      return false
    }
  }

  function setMusicSheetIds(ids: Array<string>) {
    onUpdate({ ...songHeader, selected_music_sheet_ids: ids });
  }

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full border shadow-sm rounded-md p-2 gap-4 bg-white">
        <div className="flex-center border-b text-sm px-4 py-1 text-gray-500">
          {specialOrderType === WorshipSpecialOrderType.BEGINNING ? "Beginning Song" : "Ending Song"}
        </div>
        <AddableSongDetailDialogTrigger
          teamId={teamId}
          songId={songHeader?.id}
          selectedMusicSheetIds={songHeader?.selected_music_sheet_ids}
          setMusicSheetIds={(musicSheetIds) => setMusicSheetIds(musicSheetIds)}
          isStatic={true}
        >
          <AddedSongInnerHeader teamId={teamId} songId={songHeader?.id} selectedMusicSheetIds={songHeader?.selected_music_sheet_ids} />
        </AddableSongDetailDialogTrigger>
      </div>
      <div className="flex-between px-2 pt-1">
        <div className="flex items-center space-x-2">
          <Checkbox id={`checkedBox_${specialOrderType}`} checked={isDefaultChecked} onCheckedChange={(state) => handleCheckStateChange(state)} />
          <label
            htmlFor={`checkedBox_${specialOrderType}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500 cursor-pointer"
          >
            Set as default for future plan
          </label>
        </div>

        <div className="flex-end text-smnpx shadcn-ui@latest add dropdown-menu">
          <div className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm" onClick={() => handleRemoveSong()}>remove</div>
        </div>
      </div>
    </div>
  )
}
