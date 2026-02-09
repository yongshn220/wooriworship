import { Textarea } from "@/components/ui/textarea";
import { useRecoilValueLoadable } from "recoil";
import { SetlistSongHeader } from "@/models/setlist";
import { MusicSheet } from "@/models/music_sheet";
import { songAtom } from "@/global-states/song-state";
// Removed SwapOrderButton import as we use drag and drop now
import React from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { MusicSheetKeyButton } from "@/components/elements/design/song/music-sheet-key-button";

interface Props {
  teamId: string
  songOrder: number
  songHeader: SetlistSongHeader
  onUpdate: (updatedHeader: SetlistSongHeader) => void
  onRemove: () => void
  dragHandle?: React.ReactNode
}

import { PlanCard } from "@/components/common/card/plan-card";

export function AddedSongHeaderDefault({ teamId, songOrder, songHeader, onUpdate, onRemove, dragHandle }: Props) {
  const songLoadable = useRecoilValueLoadable(songAtom({ teamId, songId: songHeader?.id }))
  // Fetch all available keys for this song to render toggle buttons
  const musicSheetsLoadable = useRecoilValueLoadable(musicSheetsBySongIdAtom({ teamId, songId: songHeader?.id }))

  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Note Visibility State
  const [showNote, setShowNote] = React.useState(!!songHeader?.note);

  // Auto-show if note exists
  React.useEffect(() => {
    if (songHeader?.note && !showNote) {
      setShowNote(true);
    }
  }, [songHeader?.note, showNote]);

  if (songLoadable.state === 'loading' || musicSheetsLoadable.state === 'loading') {
    return <Skeleton className="w-full h-[220px] rounded-2xl" />
  }

  // Handle errors gracefully? For now assume valid.
  if (songLoadable.state === 'hasError' || !songLoadable.contents) {
    return <div className="p-4 border border-red-200 rounded text-red-500">Error loading song</div>
  }

  const song = songLoadable.contents;
  const musicSheets = musicSheetsLoadable.state === 'hasValue' ? musicSheetsLoadable.contents : [];

  // Current selected keys for this instance
  const selectedKeys = songHeader?.selected_music_sheet_ids || []

  function handleOnNoteChange(input: string) {
    onUpdate({ ...songHeader, note: input });
  }

  function handleToggleKey(sheetId: string) {
    let newSelectedKeys = []
    if (selectedKeys.includes(sheetId)) {
      newSelectedKeys = selectedKeys.filter(id => id !== sheetId)
    } else {
      // Toggle On
      newSelectedKeys = [...selectedKeys, sheetId]
    }

    // Determine the key to display (first selected sheet's key)
    const firstSelectedSheetId = newSelectedKeys[0]
    const firstSelectedSheet = musicSheets?.find((s: MusicSheet) => s.id === firstSelectedSheetId)
    const displayKey = firstSelectedSheet?.key || ""

    // Update State (Allow empty keys)
    onUpdate({ ...songHeader, selected_music_sheet_ids: newSelectedKeys, key: displayKey });
  }



  return (
    <div className="w-full">
      {/* Read-Only Detail Dialog */}
      <SongDetailDialog
        teamId={teamId}
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        songId={songHeader?.id}
        readOnly={true}
      />

      <PlanCard
        order={songOrder}
        dragHandle={dragHandle}
        onRemove={onRemove}
        className={cn("gap-2", showNote ? "min-h-[160px]" : "min-h-[100px] pb-3")}
      >
        {/* Title Section: Click to Open Detail */}
        <div className={cn("cursor-pointer pr-12", dragHandle && "pl-16")} onClick={() => setIsDetailOpen(true)}>
          <div className="flex flex-col gap-0.5 w-full">
            <h3 className="text-lg font-bold text-gray-900 leading-tight w-full break-words">
              {song?.title}
            </h3>
            {song?.subtitle && (
              <p className="text-sm text-gray-400 font-normal w-full break-words line-clamp-2">
                {song?.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Inline Key Toggles */}
        <div className={cn("flex flex-wrap gap-2", dragHandle && "pl-16")}>
          {musicSheets?.map((sheet: MusicSheet) => {
            const isSelected = selectedKeys.includes(sheet.id)
            const orderIndex = selectedKeys.indexOf(sheet.id)
            return (
              <MusicSheetKeyButton
                key={sheet.id}
                musicKey={sheet.key}
                keyNote={sheet.note}
                isSelected={isSelected}
                onToggle={() => handleToggleKey(sheet.id)}
                orderIndex={selectedKeys.length > 1 ? orderIndex : undefined}
                variant="compact"
              />
            )
          })}
        </div>

        {/* Note Area */}
        <div className={cn("w-full flex-1", showNote ? "mt-2" : "mt-0")}>
          {showNote ? (
            <Textarea
              className="w-full h-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-base text-gray-700 resize-none placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              placeholder="Write a note..."
              value={songHeader?.note}
              onChange={(e) => handleOnNoteChange(e.target.value)}
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              className={cn(
                "w-full h-8 justify-start text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium p-0 bg-transparent hover:bg-transparent",
                dragHandle ? "pl-16" : "pl-0"
              )}
              onClick={() => setShowNote(true)}
            >
              <span className="text-xs">+ Write a note</span>
            </Button>
          )}
        </div>
      </PlanCard>
    </div>
  )
}
