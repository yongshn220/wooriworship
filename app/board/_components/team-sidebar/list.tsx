"use client"

import {Team} from "@/models/team";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userAtom} from "@/global-states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";
import {useEffect, useState} from "react";
import {currentTeamAtom} from "@/global-states/teamState";

export function List() {
  const user = useRecoilValue(userAtom)
  const [teams, setTeams] = useState([])
  const setCurrentTeam = useSetRecoilState(currentTeamAtom)

  useEffect(() => {
    // todo: firebase api call
    setTeams([])
  }, [])

  return (
    <>
      {
        teams.map((team: Team) => (
          <TeamIconHint key={team.id} name={team.name}/>
        ))
      }
    </>
  )
}
