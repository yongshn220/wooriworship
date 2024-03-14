'use client'

import {Plus} from 'lucide-react'
import {
  Dialog,
  DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Hint} from "@/components/hint";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TeamIcon} from "@/components/team-icon";
import {useState} from "react";


export function NewButton() {
  const [teamName, setTeamName] = useState("New Team")

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
            "His praise shall continually be in my mouth." - <span className="text-xs">Psalm 34:1</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={teamName}
              className="col-span-3"
              onChange={(e) => {setTeamName(e.target.value)}}
            />
          </div>
        </div>
        <div className="w-full flex-center">
          <TeamIcon name={teamName}/>
        </div>
        <DialogFooter>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
