"use client"

import React, {useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {useRecoilValue, useRecoilValueLoadable, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {auth} from "@/firebase";
import {userAtom} from "@/global-states/userState";
import {toast} from "@/components/ui/use-toast";
import useUserPreferences from "@/components/util/hook/use-local-preference";


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
  const [, setPreferences] = useUserPreferences()

  const handleInvalidTeam = useCallback(() => {
    setCurrentTeamId(null)
    setPreferences.boardSelectedTeamId("")
    router.replace("/board")
  }, [setCurrentTeamId, setPreferences, router])

  useEffect(() => {
    if (!teamId) {
      handleInvalidTeam()
      return;
    }

    if (teamLoadable.state === 'hasError') {
      handleInvalidTeam()
      return;
    }

    if (teamLoadable.state === 'hasValue' && teamLoadable.contents === null) {
      handleInvalidTeam()
      return;
    }

    if (teamLoadable.state === 'hasValue' && !user.teams.includes(teamId)) {
      toast({title: "Unauthorized Member", description: `You have no permission to the team [${teamLoadable.contents.name}].`})
      handleInvalidTeam()
      return;
    }

    setCurrentTeamId(teamId)
  }, [setCurrentTeamId, teamId, user.teams, router, teamLoadable, handleInvalidTeam]);


  return (
    <div className="w-full h-full">
      {
        (teamLoadable.state === 'hasValue' && teamLoadable.contents?.id) && children
      }
    </div>
  )
}
