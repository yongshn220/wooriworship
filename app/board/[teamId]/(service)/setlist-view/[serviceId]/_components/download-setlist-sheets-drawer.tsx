'use client'

import { Button } from "@/components/ui/button";
import { useRecoilValue } from "recoil";
import { useState, useEffect, useMemo } from "react";
import { setlistAtom } from "@/global-states/setlist-state";
import { songAtom } from "@/global-states/song-state";
import { shareMusicSheets } from "@/components/util/helper/helper-functions";
import { Check, Music, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Song } from "@/models/song";
import { SetlistSongHeader } from "@/models/setlist";

interface Props {
    children?: React.ReactNode
    teamId: string
    serviceId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DownloadSetlistSheetsDrawer({ children, teamId, serviceId, open, onOpenChange }: Props) {
    const setlist = useRecoilValue(setlistAtom({ teamId, setlistId: serviceId }))

    // Aggregate all song headers (beginning + main songs + ending)
    const allSongHeaders = useMemo(() => {
        const headers: SetlistSongHeader[] = []
        if (setlist?.beginning_song?.id) {
            headers.push(setlist.beginning_song)
        }
        setlist?.songs?.forEach((song) => {
            if (song?.id) headers.push(song)
        })
        if (setlist?.ending_song?.id) {
            headers.push(setlist.ending_song)
        }
        return headers
    }, [setlist])

    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([])
    const [internalOpen, setInternalOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const isControlled = open !== undefined && onOpenChange !== undefined
    const isOpen = isControlled ? open : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    // Reset selection when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedSongIds(allSongHeaders.map(h => h.id))
        }
    }, [isOpen, allSongHeaders])

    async function handleDownload() {
        setIsDownloading(true)
        try {
            const downloadSongs = allSongHeaders
                .filter((header) => selectedSongIds.includes(header.id))
                .map((header) => ({
                    id: header.id,
                    title: header.title || "Unknown",
                    team_id: teamId,
                } as Song))

            await shareMusicSheets(downloadSongs)
            setIsOpen(false)
        } finally {
            setIsDownloading(false)
        }
    }

    function handleToggleSong(songId: string) {
        if (selectedSongIds.includes(songId)) {
            setSelectedSongIds((prev) => prev.filter((id) => id !== songId))
        } else {
            setSelectedSongIds((prev) => [...prev, songId])
        }
    }

    function handleToggleAll() {
        if (selectedSongIds.length === allSongHeaders.length) {
            setSelectedSongIds([])
        } else {
            setSelectedSongIds(allSongHeaders.map(h => h.id))
        }
    }

    return (
        <ResponsiveDrawer
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={children}
            title="Download Sheets"
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-0">
                    {allSongHeaders.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                <Music className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium text-base">No songs available</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0">
                            {allSongHeaders.map((header, index) => (
                                <SongSelectItem
                                    key={`${header.id}-${index}`}
                                    teamId={teamId}
                                    songHeader={header}
                                    isSelected={selectedSongIds.includes(header.id)}
                                    onToggle={() => handleToggleSong(header.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 pb-8 z-20 flex flex-col gap-4 items-center mt-auto">
                    <Button
                        onClick={handleDownload}
                        disabled={selectedSongIds.length === 0 || isDownloading}
                        className={cn(
                            "w-full h-14 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] text-lg font-bold",
                            selectedSongIds.length === 0
                                ? "bg-secondary text-muted-foreground shadow-none hover:bg-secondary"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? "Downloading..." : `Download ${selectedSongIds.length > 0 ? `(${selectedSongIds.length})` : ""}`}
                    </Button>

                    <Button
                        variant="link"
                        onClick={handleToggleAll}
                        className="h-auto p-0 text-muted-foreground hover:text-foreground text-sm font-medium hover:no-underline transition-colors"
                    >
                        {selectedSongIds.length === allSongHeaders.length ? "Unselect All" : "Select All Songs"}
                    </Button>
                </div>
            </div>
        </ResponsiveDrawer>
    )
}

interface SongSelectItemProps {
    teamId: string
    songHeader: SetlistSongHeader
    isSelected: boolean
    onToggle: () => void
}

function SongSelectItem({ teamId, songHeader, isSelected, onToggle }: SongSelectItemProps) {
    // Fetch full song data for display
    const song = useRecoilValue(songAtom({ teamId, songId: songHeader.id }))

    const title = song?.title || songHeader.title || "Unknown Song"
    const displayKey = songHeader.key || song?.keys?.[0]

    return (
        <div
            onClick={onToggle}
            className="group flex items-center py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-muted/50 active:scale-[0.98]"
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
                    {title}
                </h4>

                {displayKey && (
                    <div className={cn(
                        "flex items-center justify-center ml-2 px-2.5 h-6 text-xs font-bold rounded-lg transition-all",
                        isSelected
                            ? "text-muted-foreground bg-secondary"
                            : "text-muted-foreground/50 bg-transparent group-hover:text-muted-foreground"
                    )}>
                        {displayKey}
                    </div>
                )}
            </div>
        </div>
    )
}
