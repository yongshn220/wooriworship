"use client"

import {TeamIconHint} from "@/components/team-icon-hint";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {auth} from "@/firebase";
import {useEffect, useState} from "react";

export function List() {
  const [user, setUser] = useState<User>(null)
  const authUser = auth.currentUser

  useEffect(() => {
    UserService.getById(authUser?.uid).then((_user) => {
      if (_user)
        setUser(_user as User)
    })
  }, [authUser.uid])

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
