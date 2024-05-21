"use client"

import {TeamIconHint} from "@/components/team-icon-hint";
import {auth} from "@/firebase";
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";

export function List() {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(authUser?.uid))

  if (!authUser) {
    console.log("no session")
    return <></>
  }

  return (
    <>
      {
        user?.teams.map((teamId: string) => (
          <TeamIconHint key={teamId} teamId={teamId}/>
        ))
      }
    </>
  )
}
