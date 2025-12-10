import { useRecoilState, useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import { selectedWorshipSongHeaderListAtom } from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import * as React from "react";

interface Props {
  teamId: string
  songId: string
}

export function AddableSongHeaderDefault({ teamId, songId }: Props) {
  const song = useRecoilValue(songAtom(songId))
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)

  // Check if this song is already in the setlist
  const existingSongIndex = selectedWorshipSongHeaderList.findIndex(header => header.id === songId)
  const isSelected = existingSongIndex !== -1
  const selectedSheetIds = isSelected ? selectedWorshipSongHeaderList[existingSongIndex].selected_music_sheet_ids : []

  function handleToggleKey(sheetId: string) {
    if (isSelected) {
      // Song is already added, toggle the key
      const currentSheets = selectedWorshipSongHeaderList[existingSongIndex].selected_music_sheet_ids || []
      let newSheets = []
      if (currentSheets.includes(sheetId)) {
        newSheets = currentSheets.filter(id => id !== sheetId)
      } else {
        newSheets = [...currentSheets, sheetId]
      }

      // If no sheets left, maybe remove the song? Or keep it with empty keys?
      // User behavior: usually wants to remove if unchecking all?
      // Let's decide: If 0 keys, keep song but 0 keys. Or remove.
      // For "One Click Add", strictly speaking, clicking "A" enables A. Uncliking A disables A.
      // If all disabled, song is effectively "not playing" or "no key". 
      // Let's just update the sheets.

      const newList = [...selectedWorshipSongHeaderList]
      newList[existingSongIndex] = {
        ...newList[existingSongIndex],
        selected_music_sheet_ids: newSheets
      }

      // OPTIONAL: If newSheets is empty, remove the song?
      if (newSheets.length === 0) {
        const listAfterRemove = newList.filter(h => h.id !== songId)
        setSelectedWorshipSongHeaderList(listAfterRemove)
      } else {
        setSelectedWorshipSongHeaderList(newList)
      }

    } else {
      // Song not added, add it with this key
      setSelectedWorshipSongHeaderList(prev => [...prev, {
        id: songId,
        note: song?.description || "",
        selected_music_sheet_ids: [sheetId]
      }])
    }
  }

  // Fallback if no sheets/keys exist? We should allow adding with no key?
  // Current UI shows Keys. If no keys, user can't click?
  // Maybe click the Title to add as "No Key"? 

  return (
    <div className="flex w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 items-center gap-4 transition-colors">

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-gray-900 truncate text-base">
            {song?.title}
            {song?.subtitle && <span className="text-gray-500 font-medium ml-1 text-sm">({song?.subtitle})</span>}
          </p>
        </div>
        <p className="text-sm text-gray-400 truncate">{song?.original?.author || "Unknown Artist"}</p>
      </div>

      {/* Key Buttons (The Chips) */}
      <div className="flex items-center gap-2 shrink-0">
        {musicSheets?.length === 0 && (
          <button
            onClick={() => {
              // Add without key?
              // Currently our logic requires sheetId? 
              // If no sheets, maybe we can't select key.
              // Just add song.
              if (isSelected) {
                setSelectedWorshipSongHeaderList(prev => prev.filter(h => h.id !== songId))
              } else {
                setSelectedWorshipSongHeaderList(prev => [...prev, {
                  id: songId, note: song?.description || "", selected_music_sheet_ids: []
                }])
              }
            }}
            className={`h-9 px-4 rounded-full text-sm font-bold transition-all ${isSelected ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            {isSelected ? "Added" : "Add"}
          </button>
        )}

        {musicSheets?.map((sheet, idx) => {
          const isKeySelected = selectedSheetIds.includes(sheet.id)
          return (
            <button
              key={sheet.id}
              onClick={() => handleToggleKey(sheet.id)}
              className={`
                     h-10 min-w-[3rem] px-3 rounded-xl text-sm font-bold transition-all border
                     ${isKeySelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"}
                   `}
            >
              {sheet.key}
            </button>
          )
        })}
      </div>

    </div>
  )
}
