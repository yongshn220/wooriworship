'use client'

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TeamIcon} from "@/components/elements/design/team/team-icon";
import {ReactNode, useState} from "react";
import {toast} from "@/components/ui/use-toast";
import { TeamService, UserService } from '@/apis';
import {auth} from "@/firebase";
import {useSetRecoilState} from "recoil";
import {userUpdaterAtom} from "@/global-states/userState";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/util/helper/routes";
import {currentTeamIdAtom} from "@/global-states/teamState";


export function CreateNewTeamDialog({children}: {children: ReactNode}) {
  const authUser = auth.currentUser
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const setTeamId = useSetRecoilState(currentTeamIdAtom)
  const [teamName, setTeamName] = useState("New Team")
  const router = useRouter()

  if (!authUser) return <></>

  async function handleCreateNewTeam() {
    if (authUser) {
      try {
        const teamId = await TeamService.addNewTeam(authUser.uid, teamName);
        UserService.addNewTeam(authUser.uid, teamId).then(teamId => {
          if (!teamId) {
            toast({title: "Oops, fail to create team. Please try again later.",})
          }
          else {
            setUserUpdater(prev => prev + 1)
            toast({
              title: "Congratulation! New team has created.",
              description: `${teamName}`,
            })
            setTeamId(teamId)
            router.push(getPathPlan(teamId))
          }
        });
      }
      catch(err) {
        console.log(err);
        alert({
          title: "Error on creating New Team from Server"
        })
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create new team</DialogTitle>
          <DialogDescription>
            &quot;His praise shall continually be in my mouth.&quot; - <span className="text-xs">Psalm 34:1</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Name
            </Label>
            <Input
              id="name"
              value={teamName}
              onChange={(e) => {setTeamName(e.target.value)}}
            />
            <TeamIcon name={teamName}/>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogClose className="flex-end">
          <Button type="submit" onClick={handleCreateNewTeam}>Create</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
