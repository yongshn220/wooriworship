'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { worshipSongListAtom } from "@/global-states/worship-state";
import { shareMusicSheets } from "@/components/util/helper/helper-functions";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Download, Music, X, CheckCircle2, Circle } from "lucide-react";
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
        <div className="p-6 pb-4 border-b border-gray-100/50 z-10 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Download Music Sheets
            </DialogTitle>
            <DialogClose className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
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
            <div className="py-10 text-center text-gray-400 flex flex-col items-center">
              <Music className="w-12 h-12 mb-2 opacity-20" />
              <p>No songs available</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {songList.map((song, i) => {
                const isSelected = selectedSongIds.includes(song.id)
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => handleToggleSong(song.id)}
                    className={cn(
                      "group relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "bg-blue-50/50 border-blue-500 shadow-sm"
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    {/* Selection Indicator */}
                    <div className={cn(
                      "mr-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "text-blue-600 scale-110"
                        : "text-gray-300 group-hover:text-gray-400 scale-100"
                    )}>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={cn(
                          "font-semibold truncate text-base transition-colors",
                          isSelected ? "text-gray-900" : "text-gray-700"
                        )}>
                          {song.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {song.keys && song.keys.length > 0 ? (
                          <Badge variant="secondary" className={cn(
                            "h-5 px-1.5 text-[10px] sm:text-xs font-mono font-medium border",
                            isSelected ? "bg-white border-blue-200 text-blue-700" : "bg-gray-100 border-gray-200 text-gray-500"
                          )}>
                            {song.keys[0]}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">No Key</span>
                        )}
                      </div>
                    </div>

                    {/* Checkmark Animation (Optional overlay effect) */}
                    {isSelected && (
                      <motion.div
                        layoutId="checkmark"
                        className="absolute right-3 top-3 text-blue-500 opacity-0"
                        animate={{ opacity: 1 }}
                      >
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleToggleAll}
            className="text-gray-500 hover:text-gray-900 text-sm font-medium px-2"
          >
            {selectedSongIds.length === songList.length ? "Unselect All" : "Select All"}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={selectedSongIds.length === 0}
            className={cn(
              "flex-1 bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/20 transition-all active:scale-95",
              selectedSongIds.length === 0 && "opacity-50 grayscale shadow-none"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
            {selectedSongIds.length > 0 && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {selectedSongIds.length}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
