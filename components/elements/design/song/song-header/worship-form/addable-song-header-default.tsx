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
                  onClick={() => {
                    if (isSelected) {
                      setSelectedWorshipSongHeaderList(prev => prev.filter(h => h.id !== songId))
                    } else {
                      setSelectedWorshipSongHeaderList(prev => [...prev, {
                        id: songId, note: song?.description || "", selected_music_sheet_ids: []
                      }])
                    }
                  }}
                  className={`h-8 px-4 rounded-full text-xs font-bold transition-all ${isSelected ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
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
                    className={`
                             h-9 min-w-[3rem] px-3 rounded-lg text-sm font-bold transition-all border
                             ${isKeySelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-100 ring-2 ring-blue-600 ring-offset-1"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}
                           `}
                  >
                    {sheet.key}
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
