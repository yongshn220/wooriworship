"use client"

import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {worshipBeginningSongIdAtom, worshipEndingSongIdAtom} from "@/app/board/[teamId]/plan/_components/status";
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

interface Props {
  teamId: string
  specialOrderType: WorshipSpecialOrderType
  songId: string
}

type CheckState = boolean | "indeterminate"

export function StaticSongCard({teamId, specialOrderType, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const [team, setTeam] = useRecoilState(teamAtom(teamId))
  const setWorshipBeginningSongId = useSetRecoilState(worshipBeginningSongIdAtom)
  const setWorshipEndingSongId = useSetRecoilState(worshipEndingSongIdAtom)
  const [checked, setChecked] = useState<CheckState>(false)

  useEffect(() => {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      if (team?.option?.worship?.beginning_song_id && team?.option?.worship?.beginning_song_id === songId) {
        setChecked(true)
      }
    }
    else {
      if (team?.option?.worship?.ending_song_id && team?.option?.worship?.ending_song_id === songId) {
        setChecked(true)
      }
    }
  }, [songId, specialOrderType, team?.option?.worship?.beginning_song_id, team?.option?.worship])

  function handleRemoveSong() {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      setWorshipBeginningSongId(null); return
    }
    if (specialOrderType === WorshipSpecialOrderType.ENDING) {
      setWorshipEndingSongId(null); return
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

      teamOption.worship = {
        beginning_song_id: (specialOrderType === WorshipSpecialOrderType.BEGINNING)? (state)? songId : null : teamOption.worship.beginning_song_id,
        ending_song_id: (specialOrderType === WorshipSpecialOrderType.ENDING)? (state)? songId : null : teamOption.worship.ending_song_id
      }

      setTeam((prev) => ({...prev, option: teamOption}))
      if (await TeamService.updateTeamOption(teamId, teamOption) === false) {
        /* Handle Error*/
        console.log("err:setStaticSongAsDefaultOption")
        toast({
          title: "Fail to set default Beginning/Ending song. Please try again"
        })
      }



      /* Successfully updated*/
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

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full border shadow-sm rounded-md p-2 gap-4 bg-white">
        <div className="flex-center border-b text-sm px-4 py-1 text-gray-500">
          {specialOrderType === WorshipSpecialOrderType.BEGINNING ? "Beginning Song" : "Ending Song"}
        </div>
        <SongDetailCardWrapper teamId={teamId} songId={songId}>
          <SongListItem songId={songId} viewMode={ViewMode.NONE}/>
        </SongDetailCardWrapper>
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
