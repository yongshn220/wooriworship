"use client"
import {Team} from "@/models/team";
import React from "react";
import {useRecoilValue} from "recoil";
import {teamListAtom} from "@/states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";

export function List() {
  const teamList = useRecoilValue(teamListAtom)

  return (
    <React.Fragment>
      {
        teamList.map((team: Team) => (
          <TeamIconHint key={team.id} name={team.name}/>
        ))
      }
    </React.Fragment>
  )
}
