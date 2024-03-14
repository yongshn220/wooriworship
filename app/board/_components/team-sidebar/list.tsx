"use client"
import {Team} from "@/models/team";
import React from "react";
import {TeamIcon} from "@/components/team-icon";
import {useRecoilValue} from "recoil";
import {teamListAtom} from "@/states/userState";

export function List() {
  const teamList = useRecoilValue(teamListAtom)
  return (
    <React.Fragment>
      {
        teamList.map((team: Team) => (
          <TeamIcon key={team.id} name={team.name}/>
        ))
      }
    </React.Fragment>
  )
}
