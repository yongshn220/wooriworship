"use client"

import {Suspense} from "react";
import {SongDetailRedesign} from "@/components/elements/design/song/song-detail-card/redesign/song-detail-redesign";
import {useDialogState} from "@/components/common/hooks/use-dialog-state";

interface Props {
  teamId: string
  songId: string
  children: React.ReactNode
}
export function SongDetailDialogTrigger({teamId, songId, children}: Props) {
  const dialog = useDialogState();

  return (
    <>
      {/* P1-6: Only mount dialog when open to prevent unnecessary Recoil evaluations */}
      {dialog.isOpen && (
        <Suspense fallback={<></>}>
          <SongDetailRedesign teamId={teamId} isOpen={dialog.isOpen} setIsOpen={dialog.setIsOpen} songId={songId} readOnly={false}/>
        </Suspense>
      )}
      {/* P1-5: Use button for keyboard accessibility (Enter/Space opens dialog, focusable, screen reader support) */}
      <button
        type="button"
        onClick={dialog.toggle}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        aria-label="View song details"
      >
        {children}
      </button>
    </>
  )
}
