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
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-none shadow-toss gap-0 rounded-4xl ring-1 ring-black/5 [&>button]:hidden focus:outline-none select-none">

        {/* Header */}
        <div className="relative pt-8 px-8 pb-6 z-10 flex items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-foreground tracking-tight leading-tight text-left">
            Download Sheets
          </DialogTitle>
          <DialogClose className="rounded-full p-2 bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 -mr-2">
            <X className="w-5 h-5" />
          </DialogClose>
        </div>

        {/* Scrollable Song List */}
        <div className="relative px-4 pb-4 space-y-0 max-h-[55vh] overflow-y-auto scrollbar-hide z-0 mask-image-b">
          {songList.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
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
                    className="group flex items-center py-3.5 px-4 rounded-2xl transition-all duration-200 cursor-pointer hover:bg-muted/50 active:scale-[0.98]"
                  >
                    {/* Selection Indicator */}
                    <div className={cn(
                      "mr-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-transparent group-hover:bg-secondary/80"
                    )}>
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <h4 className={cn(
                        "truncate text-lg transition-colors leading-normal",
                        isSelected ? "text-foreground font-bold" : "text-muted-foreground font-medium group-hover:text-foreground"
                      )}>
                        {song.title}
                      </h4>

                      {song.keys && song.keys.length > 0 && (
                        <div className={cn(
                          "flex items-center justify-center ml-2 px-2.5 h-6 text-xs font-bold rounded-lg transition-all",
                          isSelected
                            ? "text-muted-foreground bg-secondary" // Neutral when selected
                            : "text-muted-foreground/50 bg-transparent group-hover:text-muted-foreground"
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
        <div className="p-6 pt-4 pb-8 bg-background z-20 flex flex-col gap-4 items-center">
          <Button
            onClick={handleDownload}
            disabled={selectedSongIds.length === 0}
            className={cn(
              "w-full h-14 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] text-lg font-bold",
              selectedSongIds.length === 0
                ? "bg-secondary text-muted-foreground shadow-none hover:bg-secondary"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Download {selectedSongIds.length > 0 && `(${selectedSongIds.length})`}
          </Button>

          <Button
            variant="link"
            onClick={handleToggleAll}
            className="h-auto p-0 text-muted-foreground hover:text-foreground text-sm font-medium hover:no-underline transition-colors"
          >
            {selectedSongIds.length === songList.length ? "Unselect All" : "Select All Songs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
