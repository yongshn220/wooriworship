'use client'

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TeamIcon} from "@/components/team-icon";
import {ReactNode, useState} from "react";
import {useToast} from "@/components/ui/use-toast";
import { TeamService, UserService } from '@/apis';
import {useSession} from "next-auth/react";


export function CreateNewTeamDialog({children}: {children: ReactNode}) {
  const {data: session} = useSession()
  const [teamName, setTeamName] = useState("New Team")
  const { toast } = useToast()

  if (!session) return <></>


  async function handleCreateNewTeam() {
    if (session?.user) {
      try {
        const teamId = await TeamService.addNewTeam(session.user.id, teamName);
        await UserService.addNewTeam(session.user.id, teamId);

        toast({
          title: "New team created!",
          description: `${teamName}`,
        })
      } catch(err) {
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
