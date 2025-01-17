'use client'

import {Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {TeamItem} from "@/components/elements/design/team/team-item";
import {Button} from "@/components/ui/button";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {auth} from "@/firebase";
import {userAtom} from "@/global-states/userState";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import {CreateNewTeamDialog} from "@/components/elements/dialog/create-new-team/create-new-team-dialog";
import { Plus } from "lucide-react";
import { Suspense } from "react";

interface Props {
  createOption: boolean
}
export function TeamSelect({createOption}: Props) {
  const authUser = auth.currentUser
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)
  const user = useRecoilValue(userAtom(authUser?.uid))
  const [_, prefSetter] = useUserPreferences()

  function updatePreferenceSelectedTeamId(id: string) {
    prefSetter.boardSelectedTeamId(id)
  }

  function handleChangeTeam(teamId: string) {
    if (teamId) {
      updatePreferenceSelectedTeamId(teamId)
      setCurrentTeamId(teamId)
    }
  }

  return (
    <Select value={currentTeamId?.toString()} onValueChange={(teamId) => handleChangeTeam(teamId)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent >
        <SelectGroup>
          <SelectLabel>Teams ({user?.teams.length})</SelectLabel>
          {
            user?.teams?.map((teamId) => (
              <TeamItem key={teamId} teamId={teamId}/>
            ))
          }
          <Suspense fallback={<></>}>
            {
              createOption &&
              <CreateNewTeamDialog>
                <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Team
                  </Button>
              </CreateNewTeamDialog>
            }
          </Suspense>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
