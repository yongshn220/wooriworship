'use client'

import {Drawer, DrawerContent} from "@/components/ui/drawer";
import {Suspense} from "react";
import {SongDetailHeader} from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-header";
import {SongDetailContent} from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-content";
import {SongCommentArea} from "@/components/elements/design/song/song-detail-card/default/parts/song-comment-area";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDialog({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {

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
