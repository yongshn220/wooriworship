"use client"

import {AddableSongDetailDialog} from "@/components/elements/design/song/song-detail-card/setlist-form/addable-song-detail-dialog";
import {useDialogState} from "@/components/common/hooks/use-dialog-state";

interface Props {
  children: React.ReactNode
  teamId: string
  songId: string
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
  isStatic: boolean
  onSelectHandler?: () => void
}
export function AddableSongDetailDialogTrigger({children, teamId, songId, selectedMusicSheetIds, setMusicSheetIds, isStatic, onSelectHandler}: Props) {
  const dialog = useDialogState();

  return (
    <>
      <AddableSongDetailDialog
        teamId={teamId}
        isOpen={dialog.isOpen}
        setIsOpen={dialog.setIsOpen}
        songId={songId} readOnly={true}
        selectedMusicSheetIds={selectedMusicSheetIds}
        setMusicSheetIds={setMusicSheetIds}
        isStatic={isStatic}
        onSelectHandler={() => onSelectHandler()}
      />
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
