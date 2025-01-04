"use client"

import {Dialog, DialogContentNoCloseButton, DialogTrigger} from "@/components/ui/dialog";
import {ManageTeamContent} from "@/components/dialog/manage-team/manage-team-content";


export function ManageTeamDialog({children}: any) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full">
          {children}
        </div>
      </DialogTrigger>
      <DialogContentNoCloseButton className="flex-start flex-col sm:max-w-[600px] h-[90%] overflow-y-scroll scrollbar-hide top-1/2 -translate-y-1/2 " >
        <ManageTeamContent/>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
