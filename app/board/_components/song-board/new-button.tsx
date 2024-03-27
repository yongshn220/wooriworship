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
        <Button>
          Add Song
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Song</DialogTitle>
          <DialogDescription>Create and add new song in the song board</DialogDescription>
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
              placeholder="Title of song"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Link
            </Label>
            <Input
              id="name"
              placeholder="Related link for the song"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Version
            </Label>
            <Input
              id="name"
              placeholder="Version of the song"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-">
              Music Sheets
            </Label>
            <div className="flex-start w-full h-60 aspect-square border border-2 p-2 rounded-md shadow-sm">
              <div className="h-full flex-center flex-col p-6">
                <Plus className="h-[50px] w-[50px] rounded-full p-2 text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"/>
              </div>
              <div className="flex w-full h-full gap-4 overflow-x-scroll scrollbar-hide">
                <div className="flex flex-col h-full aspect-[3/4]">
                  <div className="flex-1 bg-gray-100"/>
                  <p className="text-center text-sm text-gray-500">1</p>
                </div>

                <div className="flex flex-col h-full aspect-[3/4]">
                  <div className="flex-1 bg-gray-100"/>
                  <p className="text-center text-sm text-gray-500">2</p>
                </div>

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
