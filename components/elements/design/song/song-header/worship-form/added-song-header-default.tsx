import { Textarea } from "@/components/ui/textarea";
import { useRecoilState, useRecoilValue } from "recoil";
import { toPlainObject } from "@/components/util/helper/helper-functions";
import { WorshipSongHeader } from "@/models/worship";
import { songAtom } from "@/global-states/song-state";
import { SwapOrderButton } from "@/components/elements/design/song/song-header/worship-form/parts/swap-order-button";
import { selectedWorshipSongHeaderListAtom } from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import React from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog"; // Use read-only detail dialog
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import { cn } from "@/lib/utils";

interface Props {
  teamId: string
  songOrder: number
  songHeader: WorshipSongHeader
}

export function AddedSongHeaderDefault({ teamId, songOrder, songHeader }: Props) {
  const [selectedSongHeaderList, setSelectedSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const song = useRecoilValue(songAtom(songHeader?.id))
  // Fetch all available keys for this song to render toggle buttons
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songHeader?.id))

  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Current selected keys for this instance
  const selectedKeys = songHeader?.selected_music_sheet_ids || []

  function handleRemoveSong() {
    setSelectedSongHeaderList(selectedSongHeaderList.filter((_header) => _header.id !== songHeader?.id))
  }

  function handleOnNoteChange(input: string) {
    const newSongInfoList = toPlainObject(selectedSongHeaderList)
    newSongInfoList.forEach((_songHeader: WorshipSongHeader) => {
      if (_songHeader?.id === songHeader?.id) {
        _songHeader.note = input
      }
    })
    setSelectedSongHeaderList(newSongInfoList)
  }

  function handleToggleKey(sheetId: string) {
    let newSelectedKeys = []
    if (selectedKeys.includes(sheetId)) {
      // Toggle Off
      newSelectedKeys = selectedKeys.filter(id => id !== sheetId)
    } else {
      // Toggle On
      newSelectedKeys = [...selectedKeys, sheetId]
    }

    // Auto-remove check
    if (newSelectedKeys.length === 0) {
      handleRemoveSong()
      return
    }

    // Update State
    setSelectedSongHeaderList((prev) => {
      const newList = JSON.parse(JSON.stringify(prev)) as Array<WorshipSongHeader>
      newList.forEach(_header => {
        if (_header?.id === songHeader?.id) {
          _header.selected_music_sheet_ids = newSelectedKeys
        }
      })
      return newList
    })
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

      <div className="relative flex flex-col w-full min-h-[160px] border shadow-sm rounded-2xl p-5 gap-4 bg-white transition-all hover:border-blue-200">

        {/* Title Section: Click to Open Detail */}
        <div className="cursor-pointer" onClick={() => setIsDetailOpen(true)}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {song?.title}
              </h3>
              <span className="text-sm text-gray-400 font-normal">
                {song?.subtitle}
              </span>
            </div>
            <p className="text-xs text-gray-400">{song?.original?.author || "Unknown Artist"}</p>
          </div>
        </div>

        {/* Inline Key Toggles */}
        <div className="flex flex-wrap gap-2">
          {musicSheets?.map((sheet) => {
            const isSelected = selectedKeys.includes(sheet.id)
            return (
              <button
                key={sheet.id}
                onClick={(e) => {
                  e.stopPropagation() // Prevent opening detail dialog
                  handleToggleKey(sheet.id)
                }}
                className={cn(
                  "h-9 px-3 min-w-[3rem] rounded-lg text-sm font-bold border transition-all active:scale-95",
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {sheet.key}
              </button>
            )
          })}
        </div>

        {/* Swap Handle */}
        <div className="absolute flex-center -translate-y-1/2 -right-4 top-1/2">
          <SwapOrderButton songHeader={songHeader} songOrder={songOrder} />
        </div>

        {/* Note Area */}
        {/* Note Area */}
        <div className="w-full flex-1 mt-2">
          <Textarea
            className="w-full h-full min-h-[60px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
            placeholder="Write a note (e.g. key change, solo part...)"
            value={songHeader?.note}
            onChange={(e) => handleOnNoteChange(e.target.value)}
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-2 pr-2">
        <div className="text-gray-400 hover:text-red-500 cursor-pointer text-xs font-medium transition-colors" onClick={() => handleRemoveSong()}>
          Remove from list
        </div>
      </div>
    </div>
  )
}
