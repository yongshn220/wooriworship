"use client"

import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
  worshipBeginningSongWrapperAtom,
  worshipEndingSongWrapperAtom
} from "@/app/board/[teamId]/plan/_components/status";
import {SongListItem, ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {WorshipSpecialOrderType} from "@/components/constants/enums";
import {Checkbox} from "@/components/ui/checkbox";
import {useEffect, useState} from "react";
import {teamAtom} from "@/global-states/teamState";
import {TeamOption} from "@/models/team";
import {TeamService} from "@/apis";
import {toast} from "@/components/ui/use-toast";
import {songAtom} from "@/global-states/song-state";
import {
  SelectSongDetailCardWrapper
} from "@/app/worship/[teamId]/[worshipId]/_components/select-song-detail-card-wrapper";
import {SongListPreviewItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-preview-item";
import {WorshipSongPreviewItem} from "@/app/worship/[teamId]/[worshipId]/_components/worship-song-preview-item";

interface Props {
  teamId: string
  specialOrderType: WorshipSpecialOrderType
  songWrapper: { id: string, key: string }
}

type CheckState = boolean | "indeterminate"

export function StaticSongCard({teamId, specialOrderType, songWrapper}: Props) {
  const song = useRecoilValue(songAtom(songWrapper?.id))
  const [team, setTeam] = useRecoilState(teamAtom(teamId))
  const setWorshipBeginningSongWrapper = useSetRecoilState(worshipBeginningSongWrapperAtom)
  const setWorshipEndingSongWrapper = useSetRecoilState(worshipEndingSongWrapperAtom)
  const [checked, setChecked] = useState<CheckState>(false)

  useEffect(() => {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      if (team?.option?.worship?.beginning_song?.id && team?.option?.worship?.beginning_song?.id === songWrapper?.id) {
        setChecked(true)
      }
    }
    else {
      if (team?.option?.worship?.ending_song?.id && team?.option?.worship?.ending_song?.id === songWrapper?.id) {
        setChecked(true)
      }
    }
  }, [songWrapper.id, specialOrderType, team?.option?.worship])

  function handleRemoveSong() {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      setWorshipBeginningSongWrapper(null); return
    }
    if (specialOrderType === WorshipSpecialOrderType.ENDING) {
      setWorshipEndingSongWrapper(null); return
    }
  }

  function handleCheckStateChange(state: CheckState) {
    if (state === "indeterminate") state = false

    setChecked(state)
    setStaticSongAsDefaultOption(state as boolean).then()
  }

  async function setStaticSongAsDefaultOption(state: boolean) {
    try {
      const teamOption: TeamOption = {...team?.option}

      if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
        teamOption.worship.beginning_song = (state)? {id: songWrapper?.id, key: songWrapper?.key} : {id: null, key: null}
      }
      else {
        teamOption.worship.ending_song = (state)? {id: songWrapper?.id, key: songWrapper?.key} : {id: null, key: null}
      }

      setTeam((prev) => ({...prev, option: teamOption}))
      if (await TeamService.updateTeamOption(teamId, teamOption) === false) {
        /* On Error */
        console.log("err:setStaticSongAsDefaultOption")
        toast({
          title: "Fail to set default Beginning/Ending song. Please try again"
        })
      }

      /* On Success */
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
    }
    catch (e) {
      console.log("err:setStaticSongAsDefaultOption", e)
      toast({
        title: "Fail to set default Beginning/Ending song. Please try again"
      })
    }
  }

  function setSelectedKey(newKey: string) {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      setWorshipBeginningSongWrapper((prev) => ({id: prev.id, key: newKey}))
    }
    else {
      setWorshipEndingSongWrapper((prev) => ({id: prev.id, key: newKey}))
    }
  }

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full border shadow-sm rounded-md p-2 gap-4 bg-white">
        <div className="flex-center border-b text-sm px-4 py-1 text-gray-500">
          {specialOrderType === WorshipSpecialOrderType.BEGINNING ? "Beginning Song" : "Ending Song"}
        </div>
        <SelectSongDetailCardWrapper
          teamId={teamId}
          songId={songWrapper?.id}
          selectedKeys={songWrapper?.key ? [songWrapper?.key] : []}
          setSelectedKeys={(selectedKeys: string[]) => setSelectedKey(selectedKeys[0])}
          isStatic={true}
        >
          <WorshipSongPreviewItem songId={songWrapper?.id} selectedKeys={[songWrapper?.key]}/>
        </SelectSongDetailCardWrapper>
      </div>
      <div className="flex-between px-2 pt-1">
        <div className="flex items-center space-x-2">
          <Checkbox id={`checkedBox_${specialOrderType}`} checked={checked} onCheckedChange={(state) => handleCheckStateChange(state)}/>
          <label
            htmlFor={`checkedBox_${specialOrderType}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
          >
            Set as default for future plan
          </label>
        </div>

        <div className="flex-end text-smnpx shadcn-ui@latest add dropdown-menu">
          <div className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm"
               onClick={() => handleRemoveSong()}>remove
          </div>
        </div>
      </div>
    </div>
  )
}
