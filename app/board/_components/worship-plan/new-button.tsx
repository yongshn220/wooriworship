'use client'

import {Plus} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useState} from "react";
import {DatePicker} from "@/app/board/_components/worship-plan/date-picker";
import {NewSongCard} from "@/app/board/_components/worship-plan/new-song-card";


export function NewButton() {
  const [isOpen, setIsOpen] = useState(false)

  function handleCreate() {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="group aspect-[1/1] border rounded-lg flex-center flex-col overflow-hidden bg-blue-500 hover:bg-blue-600 cursor-pointer">
          <Plus className="h-12 w-12 text-white stroke-1"/>
          <p className="text-sm text-white">New board</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create new worship</DialogTitle>
          <DialogDescription>Create worship and share with your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex-center gap-2">
            <TeamIcon name="GVC Friday"/>
            <p className="font-bold text-sm">GVC Friday</p>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Title
            </Label>
            <Input
              id="name"
              className=""
              placeholder="Title of worship"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Date
            </Label>
            <DatePicker/>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Description
            </Label>
            <Textarea
              className="h-40"
              placeholder="Write the description"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Songs
            </Label>
            <div className="flex-center w-full flex-col gap-8">
              <NewSongCard/>
              <NewSongCard/>
              <div className="rounded-full p-2 text-white bg-blue-500 hover:bg-blue-400 cursor-pointer">
                <Plus/>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
