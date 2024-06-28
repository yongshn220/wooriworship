"use client"

import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useRecoilValue, useRecoilValueLoadable, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {auth} from "@/firebase";
import {userAtom} from "@/global-states/userState";
import {toast} from "@/components/ui/use-toast";


interface Props {
  teamId: string
  children: React.ReactNode
}

export function TeamIdValidation({teamId, children}: Props) {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(authUser?.uid))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const teamLoadable = useRecoilValueLoadable(teamAtom(teamId))
  const router = useRouter()



  useEffect(() => {
    if (!teamId) {
      setCurrentTeamId(null)
      router.replace("/")
      return;
    }

    if (teamLoadable.state === 'hasError') {
      router.replace("/")
      return;
    }

    if (teamLoadable.state === 'hasValue' && teamLoadable.contents === null) {
      router.replace("/")
      return;
    }

    if (teamLoadable.state === 'hasValue' && !user.teams.includes(teamId)) {
      toast({title: "Unauthorized Member", description: `You have no permission to the team [${teamLoadable.contents.name}].`})
      router.replace("/")
    }
  }, [setCurrentTeamId, teamId, user.teams, router, teamLoadable]);


  return (
    <div className="w-full h-full">
      {
        (teamLoadable.state === 'hasValue' && teamLoadable.contents?.id) && children
      }
    </div>
  )
}
