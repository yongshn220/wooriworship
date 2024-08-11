'use client'

import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongCommentArea} from "@/app/board/[teamId]/song/_components/song-comment-area";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import {SongDetailContent} from "@/app/board/[teamId]/song/_components/song-detail-content";
import {SongDetailHeader} from "@/app/board/[teamId]/song/_components/song-detail-header";
import {Suspense} from "react";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDrawer({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-5/6">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide p-4">
          <Suspense fallback={<></>}>
            <SongDetailHeader teamId={teamId} songId={songId} readonly={readOnly}/>
            <SongDetailContent songId={songId}/>
            <div className="w-full flex-center">
              <SongCommentArea teamId={teamId} songId={songId}/>
            </div>
          </Suspense>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
