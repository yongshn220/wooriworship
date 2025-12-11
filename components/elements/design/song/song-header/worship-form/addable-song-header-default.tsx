import { useRecoilState, useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import { selectedWorshipSongHeaderListAtom } from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import * as React from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";

interface Props {
  teamId: string
  songId: string
}

export function AddableSongHeaderDefault({ teamId, songId }: Props) {
  const song = useRecoilValue(songAtom(songId))
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

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

  return (
    <>
      <SongDetailDialog
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        songId={songId}
        teamId={teamId}
        readOnly={true}
      />
      <div className="relative w-full h-[64px] sm:h-[100px] border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <div className="flex items-center w-full h-full p-1 sm:p-5 gap-1.5 sm:gap-3">

          {/* Song Info (Left Column) */}
          <div
            className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 sm:py-1 px-1 cursor-pointer"
            onClick={() => setIsDetailOpen(true)}
          >
            {/* Title + Subtitle */}
            <div className="text-[14px] sm:text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate leading-tight -tracking-[0.03em]">
              {song?.title}
              {song?.subtitle && (
                <span className="text-[11px] sm:text-sm font-normal text-gray-400 ml-1.5 sm:ml-2 align-baseline">
                  {song?.subtitle}
                </span>
              )}
            </div>

            {/* Author */}
            <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-auto mb-0.5">
              {song?.original?.author || "Unknown Artist"}
            </div>
          </div>

          {/* Key Buttons (The Chips) */}
          <div className="flex items-center gap-2 shrink-0">
            {musicSheets?.length === 0 && (
              <button
                onClick={() => {
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
      </div>
    </>
  )
}
