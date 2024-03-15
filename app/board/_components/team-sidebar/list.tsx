"use client"
import {Team} from "@/models/team";
import React, {useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {nameAtom, userAtom} from "@/states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";

export function List() {
  const [name, setName] = useRecoilState(nameAtom)

  const user = useRecoilValue(userAtom)

  return (
    <React.Fragment>
      {
        user.teamList.map((team: Team) => (
          <TeamIconHint key={team.id} name={team.name}/>
        ))
      }
    </React.Fragment>
  )
}
