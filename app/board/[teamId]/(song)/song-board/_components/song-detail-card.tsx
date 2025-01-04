'use client'

import {Dialog, DialogContentNoCloseButton, DialogTitle,} from "@/components/ui/dialog";
import React, {Suspense} from "react";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
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

export function SongDetailCard({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContentNoCloseButton className="sm:max-w-[600px] h-5/6">
        <VisuallyHidden>
          <DialogTitle>Song Detail</DialogTitle>
        </VisuallyHidden>
        <div className="w-full h-full overflow-y-scroll scrollbar-hide">
          <Suspense fallback={<></>}>
            <SongDetailHeader teamId={teamId} songId={songId} readonly={readOnly}/>
            <SongDetailContent songId={songId}/>
            <div className="w-full flex-center">
              <SongCommentArea teamId={teamId} songId={songId}/>
            </div>
          </Suspense>
        </div>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}

