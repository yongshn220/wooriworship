'use client'

import {Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useEffect, useState} from "react";
import {TeamItem} from "@/app/board/_components/board-sidebar/team-item";
import {Button} from "@/components/ui/button";
import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper/routes";
import {auth} from "@/firebase";
import {userAtom} from "@/global-states/userState";

export function TeamSelect() {
  const authUser = auth.currentUser
  const router = useRouter()
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)
  const user = useRecoilValue(userAtom(authUser?.uid))

  function handleChangeTeam(teamId: string) {
    if (teamId) {
      setCurrentTeamId(teamId)
      router.push(getPathPlan(teamId))
    }
  }

  return (
    <Select value={currentTeamId?.toString()} onValueChange={(teamId) => handleChangeTeam(teamId)}>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent >
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            user?.teams?.map((teamId) => (
              <TeamItem key={teamId} teamId={teamId}/>
            ))
          }
          <CreateNewTeamDialog>
            <Button variant="default" className="w-full mt-2">
              Create Team
            </Button>
          </CreateNewTeamDialog>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
