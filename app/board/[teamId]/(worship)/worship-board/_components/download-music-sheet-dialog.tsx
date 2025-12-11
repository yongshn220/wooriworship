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
import { Badge } from "@/components/ui/badge";

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
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl gap-0 sm:rounded-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 z-10 bg-white/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Download Music Sheets
            </DialogTitle>
            <DialogClose className="rounded-full p-2 hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition-colors -mr-2">
              <X className="w-5 h-5" />
            </DialogClose>
          </div>
          <DialogDescription className="text-gray-500 font-medium">
            Select songs to save to your gallery.
          </DialogDescription>
        </div>

        {/* Scrollable Song List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {songList.length === 0 ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Music className="w-8 h-8 opacity-20" />
              </div>
              <p>No songs available</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {songList.map((song, i) => {
                const isSelected = selectedSongIds.includes(song.id)
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => handleToggleSong(song.id)}
                    className={cn(
                      "group relative flex items-center p-3 rounded-2xl transition-all duration-200 cursor-pointer select-none border",
                      isSelected
                        ? "bg-blue-50/80 border-blue-100 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-gray-50/80"
                    )}
                  >
                    {/* Selection Indicator */}
                    <div className={cn(
                      "mr-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-blue-600 text-white scale-110 shadow-sm"
                        : "bg-gray-200 text-transparent group-hover:bg-gray-300 scale-100"
                    )}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between pr-2">
                      <div className="flex flex-col">
                        <h4 className={cn(
                          "font-bold truncate text-[15px] tracking-tight transition-colors mb-0.5",
                          isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                        )}>
                          {song.title}
                        </h4>

                      </div>

                      {song.keys && song.keys.length > 0 && (
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-full",
                          isSelected
                            ? "bg-white text-blue-600 shadow-sm"
                            : "bg-gray-100 text-gray-500"
                        )}>
                          {song.keys[0]}
                        </div>
                      )}
                    </div>

                    {/* Checkmark Animation (Optional overlay effect) */}
                    {isSelected && (
                      <motion.div
                        layoutId="highlight"
                        className="absolute inset-0 rounded-2xl ring-1 ring-blue-500/20 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/50 backdrop-blur-md border-t border-gray-100 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleToggleAll}
            className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 h-11 hover:bg-gray-100/50"
          >
            {selectedSongIds.length === songList.length ? "Unselect All" : "Select All"}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={selectedSongIds.length === 0}
            className={cn(
              "flex-1 h-11 bg-gray-900 hover:bg-black text-white rounded-xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98]",
              selectedSongIds.length === 0 && "opacity-50 grayscale shadow-none"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="font-semibold">Download</span>
            {selectedSongIds.length > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-md text-xs font-bold">
                {selectedSongIds.length}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
