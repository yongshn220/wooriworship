"use client"

import {Team} from "@/models/team";
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";
import {TeamIconHint} from "@/components/team-icon-hint";

export function List() {
  const user = useRecoilValue(userAtom)

  return (
    <>
      {/*{*/}
      {/*  user.teamList.map((team: Team) => (*/}
      {/*    <TeamIconHint key={team.id} name={team.name}/>*/}
      {/*  ))*/}
      {/*}*/}
    </>
  )
}
