"use client"

import {Suspense, useState} from "react";
import {SongDetailDialog} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";

interface Props {
  teamId: string
  songId: string
  children: React.ReactNode
}
export function SongDetailDialogTrigger({teamId, songId, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* P1-6: Only mount dialog when open to prevent unnecessary Recoil evaluations */}
      {isOpen && (
        <Suspense fallback={<></>}>
          <SongDetailDialog teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={false}/>
        </Suspense>
      )}
      {/* P1-5: Use button for keyboard accessibility (Enter/Space opens dialog, focusable, screen reader support) */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        aria-label="View song details"
      >
        {children}
      </button>
    </>
  )
}
