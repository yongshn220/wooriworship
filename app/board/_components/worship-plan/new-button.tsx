import {Plus} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {TeamIcon} from "@/components/team-icon";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";


export function NewButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="group aspect-[100/132] border rounded-lg flex-center flex-col overflow-hidden bg-blue-500 hover:bg-blue-600 cursor-pointer">
          <Plus className="h-12 w-12 text-white stroke-1"/>
          <p className="text-sm text-white">New board</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create new worship</DialogTitle>
          <DialogDescription>Create worship and share with your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex-center">
            <TeamIcon name="GVC Friday"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-">
              Title
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Title of worship"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-">
              Date
            </Label>
            <Input
              id="name"
              className="col-span-3"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5 mt-4">
            <Label htmlFor="name" className="text-">
              Description
            </Label>
            <Textarea
              className="col-span-3 h-40"
              placeholder="Write the description"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5 mt-4">
            <Label htmlFor="name" className="text-">
              Songs
            </Label>
            <div className="flex-center flex-col gap-4">
              <div className="w-full h-40 bg-gray-100 rounded-md"/>
              <div className="w-full h-40 bg-gray-100 rounded-md"/>
              <div className="w-full h-40 bg-gray-100 rounded-md"/>
              <div className="w-full h-40 bg-gray-100 rounded-md"/>
            </div>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogClose className="flex-end">
          <Button type="submit">Create</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
