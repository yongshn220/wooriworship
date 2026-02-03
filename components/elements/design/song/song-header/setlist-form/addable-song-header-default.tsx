import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import * as React from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { SetlistSongHeader } from "@/models/setlist";
import { cn } from "@/lib/utils";

interface Props {
  teamId: string
  songId: string
  selectedSongs: SetlistSongHeader[]
  onUpdateList: (newSongs: SetlistSongHeader[]) => void
}

export function AddableSongHeaderDefault({ teamId, songId, selectedSongs, onUpdateList }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom({ teamId, songId }))
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Check if this song is already in the setlist
  const existingSongIndex = selectedSongs.findIndex(header => header.id === songId)
  const isSelected = existingSongIndex !== -1
  const selectedSheetIds = isSelected ? selectedSongs[existingSongIndex].selected_music_sheet_ids : []

  function handleToggleKey(sheetId: string) {
    // Find the sheet to get its key
    const selectedSheet = musicSheets?.find(s => s.id === sheetId)

    if (isSelected) {
      // Song is already added, toggle the key
      const currentSheets = selectedSongs[existingSongIndex].selected_music_sheet_ids || []
      let newSheets = []
      if (currentSheets.includes(sheetId)) {
        newSheets = currentSheets.filter(id => id !== sheetId)
      } else {
        newSheets = [...currentSheets, sheetId]
      }

      // Determine the key to display (first selected sheet's key)
      const firstSelectedSheetId = newSheets[0]
      const firstSelectedSheet = musicSheets?.find(s => s.id === firstSelectedSheetId)
      const displayKey = firstSelectedSheet?.key || ""

      const newList = [...selectedSongs]
      newList[existingSongIndex] = {
        ...newList[existingSongIndex],
        selected_music_sheet_ids: newSheets,
        key: displayKey
      }

      // OPTIONAL: If newSheets is empty, remove the song?
      if (newSheets.length === 0) {
        const listAfterRemove = newList.filter(h => h.id !== songId)
        onUpdateList(listAfterRemove)
      } else {
        onUpdateList(newList)
      }

    } else {
      // Song not added, add it with this key
      onUpdateList([...selectedSongs, {
        id: songId,
        note: song?.description || "",
        selected_music_sheet_ids: [sheetId],
        key: selectedSheet?.key || ""
      }])
    }
  }

  function handleAddWithNoKey() {
    if (isSelected) {
      onUpdateList(selectedSongs.filter(h => h.id !== songId));
    } else {
      onUpdateList([...selectedSongs, {
        id: songId,
        note: song?.description || "",
        selected_music_sheet_ids: []
      }])
    }
  }

  return (
    <>
      <SongDetailDialog
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        songId={songId}
        teamId={teamId}
        readOnly={true}
      />
      <div className="relative w-full min-h-[80px] h-auto border-b border-gray-100 hover:bg-gray-50 transition-colors group py-4">
        <div className="flex flex-col w-full h-full px-4 sm:px-6 gap-3">

          {/* Song Info (Top Row) */}
          <div
            className="w-full flex flex-col justify-center cursor-pointer"
            onClick={() => setIsDetailOpen(true)}
          >
            {/* Title + Subtitle */}
            <div className="flex items-baseline gap-2 w-full">
              <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight -tracking-[0.03em]">
                {song?.title}
              </span>
              {song?.subtitle && (
                <span className="text-xs sm:text-sm font-normal text-gray-400 truncate">
                  {song?.subtitle}
                </span>
              )}
            </div>

            {/* Author */}
            <div className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">
              {song?.original?.author || "Unknown Artist"}
            </div>
          </div>

          {/* Key Buttons (Bottom Row) */}
          <div className="flex flex-col gap-1 w-full mt-2">
            {musicSheets && musicSheets.length > 0 && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Select Key</span>
            )}
            <div className="flex items-center flex-wrap gap-2 w-full">
              {musicSheets?.length === 0 && (
                <button
                  onClick={handleAddWithNoKey}
                  className={cn(
                    "h-8 px-4 rounded-full text-xs font-bold transition-all",
                    isSelected ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {isSelected ? "Added" : "Add Song"}
                </button>
              )}

              {musicSheets?.map((sheet, idx) => {
                const isKeySelected = selectedSheetIds.includes(sheet.id)
                return (
                  <button
                    key={sheet.id}
                    onClick={() => handleToggleKey(sheet.id)}
                    className={cn(
                      "min-w-[3rem] px-3 rounded-lg text-sm font-bold transition-all border flex flex-col items-center justify-center",
                      sheet.note ? "h-12 py-1" : "h-9",
                      isKeySelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-100 ring-2 ring-blue-600 ring-offset-1"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <span>{sheet.key}</span>
                    {sheet.note && (
                      <span className={cn(
                        "text-[10px] font-medium leading-tight max-w-[80px] truncate",
                        isKeySelected ? "text-white/70" : "text-gray-400"
                      )}>
                        {sheet.note}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
