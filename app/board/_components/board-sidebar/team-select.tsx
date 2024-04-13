'use client'

import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {TeamItem} from "@/app/board/_components/board-sidebar/team-item";
import {Button} from "@/components/ui/button";
import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper-function/routes";

export function TeamSelect() {
  const router = useRouter()
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)
  const {data: session} = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!session) return

    try {
      UserService.getById(session.user.id).then((_user) => {
        console.log(_user)
        setUser(_user as User)
      })
    }
    catch(e) {
      console.log(e)
    }
  }, [session])

  function handleChangeTeam(teamId: string) {
    setCurrentTeamId(teamId)
    router.push(getPathPlan(teamId))
  }


  return (
    <Select value={currentTeamId.toString()} onValueChange={(teamId) => handleChangeTeam(teamId)}>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent >
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            user?.teams.map((teamId) => (
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
