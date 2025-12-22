'use client'

import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { TeamItem } from "@/components/elements/design/team/team-item";
import { Button } from "@/components/ui/button";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { auth } from "@/firebase";
import { userAtom } from "@/global-states/userState";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { CreateNewTeamDialog } from "@/components/elements/dialog/create-new-team/create-new-team-dialog";
import { Plus } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useState } from "react";

interface Props {
  createOption: boolean
  customTrigger?: React.ReactNode
  onTeamChange?: (teamId: string) => void
}
export function TeamSelect({ createOption, customTrigger, onTeamChange }: Props) {
  const authUser = auth.currentUser
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)
  const user = useRecoilValue(userAtom(authUser?.uid))
  const [_, prefSetter] = useUserPreferences()
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)

  function updatePreferenceSelectedTeamId(id: string) {
    prefSetter.boardSelectedTeamId(id)
  }

  function handleChangeTeam(teamId: string) {
    if (teamId) {
      updatePreferenceSelectedTeamId(teamId)
      setCurrentTeamId(teamId)
      onTeamChange?.(teamId)
    }
  }

  return (
    <>
      <Select value={currentTeamId?.toString()} onValueChange={(teamId) => handleChangeTeam(teamId)}>
        {customTrigger ? (
          <SelectPrimitive.Trigger asChild>
            {customTrigger}
          </SelectPrimitive.Trigger>
        ) : (
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Team" />
          </SelectTrigger>
        )}
        <SelectContent >
          <SelectGroup>
            <SelectLabel>Teams ({user?.teams.length})</SelectLabel>
            {
              user?.teams?.map((teamId) => (
                <TeamItem key={teamId} teamId={teamId} />
              ))
            }
            {
              createOption &&
              <Button
                className="w-full mt-2"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setCreateDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Team
              </Button>
            }
          </SelectGroup>
        </SelectContent>
      </Select>
      <CreateNewTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
