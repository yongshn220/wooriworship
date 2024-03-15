"use client"
import {Team} from "@/models/team";
import React, {useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {nameAtom, teamListAtom} from "@/states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";

export function List() {
  const [name, setName] = useRecoilState(nameAtom)

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
