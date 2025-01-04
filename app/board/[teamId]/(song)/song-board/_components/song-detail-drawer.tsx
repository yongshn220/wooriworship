'use client'

import {Drawer, DrawerContent} from "@/components/ui/drawer";
import {Suspense} from "react";
import {SongDetailHeader} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-header";
import {SongDetailContent} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-content";
import {SongCommentArea} from "@/app/board/[teamId]/(song)/song-board/_components/song-comment-area";

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
