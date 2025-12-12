'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { worshipSongListAtom } from "@/global-states/worship-state";
import { shareMusicSheets } from "@/components/util/helper/helper-functions";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Download, Music, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: any
  worshipId: string
}

export function DownloadMusicSheetDialog({ children, worshipId }: Props) {
  const songList = useRecoilValue(worshipSongListAtom(worshipId))
  // Default to selecting all songs when opening
  const [selectedSongIds, setSelectedSongIds] = useState<Array<string>>([])
  const [isOpen, setIsOpen] = useState(false)

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSongIds(songList.map(s => s.id))
    }
  }, [isOpen, songList])

  async function handleDownload() {
    const downloadSongList = songList.filter((song) => selectedSongIds.includes(song.id))
    await shareMusicSheets(downloadSongList)
    setIsOpen(false)
  }

  function handleToggleSong(songId: string) {
    if (selectedSongIds.includes(songId)) {
      setSelectedSongIds((prev) => prev.filter((id) => id !== songId))
    } else {
      setSelectedSongIds((prev) => [...prev, songId])
    }
  }

  function handleToggleAll() {
    if (selectedSongIds.length === songList.length) {
      setSelectedSongIds([])
    } else {
      setSelectedSongIds(songList.map(s => s.id))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none shadow-xl gap-0 rounded-[32px] sm:rounded-[32px] ring-1 ring-black/5 [&>button]:hidden focus:outline-none select-none">

        {/* Header */}
        <div className="relative pt-8 px-8 pb-6 z-10 flex items-center justify-between">
          <DialogTitle className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight text-left">
            Download Sheets
          </DialogTitle>
          <DialogClose className="rounded-full p-2 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all duration-200 -mr-2">
            <X className="w-5 h-5 text-gray-400" />
          </DialogClose>
        </div>

        {/* Scrollable Song List */}
        <div className="relative px-4 pb-4 space-y-0 max-h-[55vh] overflow-y-auto scrollbar-hide z-0 mask-image-b">
          {songList.length === 0 ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Music className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-medium text-base">No songs available</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {songList.map((song) => {
                const isSelected = selectedSongIds.includes(song.id)
                return (
                  <div
                    key={song.id}
                    onClick={() => handleToggleSong(song.id)}
                    className="group flex items-center py-3.5 px-4 rounded-[16px] transition-all duration-200 cursor-pointer hover:bg-black/[0.02] active:scale-[0.98]"
                  >
                    {/* Selection Indicator */}
                    <div className={cn(
                      "mr-4 w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-transparent group-hover:bg-gray-200"
                    )}>
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <h4 className={cn(
                        "truncate text-[17px] transition-colors leading-normal",
                        isSelected ? "text-gray-900 font-bold" : "text-gray-500 font-medium group-hover:text-gray-800"
                      )}>
                        {song.title}
                      </h4>

                      {song.keys && song.keys.length > 0 && (
                        <div className={cn(
                          "flex items-center justify-center ml-2 px-2.5 h-6 text-[11px] font-[700] rounded-lg transition-all",
                          isSelected
                            ? "text-gray-500 bg-gray-100" // Neutral when selected
                            : "text-gray-300 bg-transparent group-hover:text-gray-400"
                        )}>
                          {song.keys[0]}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 pb-8 bg-white z-20 flex flex-col gap-4 items-center">
          <Button
            onClick={handleDownload}
            disabled={selectedSongIds.length === 0}
            className={cn(
              "w-full h-[52px] rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] text-[16px] font-bold",
              selectedSongIds.length === 0
                ? "bg-gray-100 text-gray-400 shadow-none hover:bg-gray-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            Download {selectedSongIds.length > 0 && `(${selectedSongIds.length})`}
          </Button>

          <Button
            variant="link"
            onClick={handleToggleAll}
            className="h-auto p-0 text-gray-400 hover:text-gray-600 text-[13px] font-medium hover:no-underline transition-colors"
          >
            {selectedSongIds.length === songList.length ? "Unselect All" : "Select All Songs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
