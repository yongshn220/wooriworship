"use client"

import {Suspense, useState} from "react";
import {AddWorshipSongDialog} from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog";

interface Props {
  teamId: string
  children: React.ReactNode
}
export function AddWorshipSongDialogTrigger({teamId, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Suspense fallback={<></>}>
        <AddWorshipSongDialog teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen}/>
      </Suspense>
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
