'use client'

import {Plus} from 'lucide-react'
import {
  Dialog, DialogClose,
  DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Hint} from "@/components/hint";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TeamIcon} from "@/components/team-icon";
import {useState} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import {userAtom} from "@/states/userState";
import {useToast} from "@/components/ui/use-toast";


export function NewButton() {
  const [user, setUser] = useRecoilState(userAtom)
  const [teamName, setTeamName] = useState("New Team")
  const { toast } = useToast()

  function handleCreateNewTeam() {
    const newTeamList: any = [...user.teamList, {id: Math.random().toString(), name: teamName}]
    setUser((prev) => ({...prev, teamList: newTeamList}))

    toast({
      title: "New team created!",
      description: `${teamName}`,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="aspect-square">
          <Hint label="Create Team" side="right" align="start" sideOffset={18}>
            <button className="bg-white/25 h-[40px] w-[40px] rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition">
              <Plus className="text-white"></Plus>
            </button>
          </Hint>
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
