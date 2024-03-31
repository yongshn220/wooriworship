"use client"

import {Team} from "@/models/team";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentUserAtom} from "@/global-states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";
import {useEffect, useState} from "react";
import {currentTeamAtom} from "@/global-states/teamState";
import {TeamService} from "@/apis"

export function List() {
  const user = useRecoilValue(currentUserAtom)
  const [teams, setTeams] = useState([])
  const setCurrentTeam = useSetRecoilState(currentTeamAtom)

  useEffect(() => {
    console.log(user);
    async function getTeamsOfCurrentUser() {
      if(user){
        return TeamService.getByIds([...user.teams]);
      }
      return [];
    } 
    getTeamsOfCurrentUser().then((val) => {
      console.log(val);
    })
    //TeamService.getTeams()
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
