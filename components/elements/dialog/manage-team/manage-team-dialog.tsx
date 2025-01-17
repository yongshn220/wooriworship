"use client"

import {ManageTeamContent} from "@/components/elements/dialog/manage-team/manage-team-content";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Suspense } from "react";


export function ManageTeamDialog({children}: any) {

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="w-full">
          {children}
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-5/6">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide p-4">
          <Suspense fallback={<div></div>}>
            <ManageTeamContent/>
          </Suspense>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
