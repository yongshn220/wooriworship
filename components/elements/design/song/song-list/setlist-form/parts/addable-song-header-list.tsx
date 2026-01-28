"use client"
import { useRecoilValueLoadable } from "recoil";
import { currentTeamSongIdsAtom } from "@/global-states/song-state";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import {
  AddableSongHeaderDefault
} from "@/components/elements/design/song/song-header/setlist-form/addable-song-header-default";
import { SetlistSongHeader } from "@/models/setlist";

interface Props {
  teamId: string
  showSelectedOnly?: boolean
  selectedSongs: SetlistSongHeader[]
  onUpdateList: (newSongs: SetlistSongHeader[]) => void
}

export function AddableSongHeaderList({ teamId, showSelectedOnly = false, selectedSongs, onUpdateList }: Props) {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))
  const [displayedCount, setDisplayedCount] = useState(20)
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  // 1. Safely extract and filter data at the top level
  const rawSongIds = songIdsLoadable.state === 'hasValue' ? (songIdsLoadable.contents as string[]) : []

  let allSongIds = [...rawSongIds]
  if (showSelectedOnly) {
    allSongIds = selectedSongs.map(h => h.id)
  }

  const visibleSongIds = allSongIds.slice(0, displayedCount)

  // 2. useEffect now has access to visibleSongIds
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => prev + 20)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [songIdsLoadable.state, visibleSongIds.length, showSelectedOnly])

  if (!showSelectedOnly && songIdsLoadable.state === 'loading') {
    return (
      <div className="w-full px-5 pt-10 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-16 bg-gray-100 rounded-lg animate-pulse flex items-center px-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full mr-4" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (songIdsLoadable.state === 'hasError') {
    // Avoid throwing to not crash whole form, just show error
    return <div className="p-4 text-red-500">Failed to load songs.</div>
  }

  return (
    <div className="w-full pb-20">
      {
        (allSongIds.length > 0) &&
        <div className="w-full pl-5">
          <div className="hidden md:flex text-sm text-gray-600 px-6 mt-10 font-semibold mb-2">
            <p className="flex-1">Title</p>
            <div className="flex shrink-0 w-[200px] justify-end pr-4">Keys</div>
          </div>
        </div>
      }
      {
        (allSongIds.length > 0) ?
          <div className="w-full box-border">
            {
              visibleSongIds.map((songId) => (
                <div key={songId} className="w-full">
                  <React.Suspense fallback={<div className="h-16 w-full animate-pulse bg-gray-50 mb-2 rounded" />}>
                    <AddableSongHeaderDefault
                      teamId={teamId}
                      songId={songId}
                      selectedSongs={selectedSongs}
                      onUpdateList={onUpdateList}
                    />
                  </React.Suspense>
                  <Separator />
                </div>
              ))
            }
            {/* Load Trigger */}
            {visibleSongIds.length < allSongIds.length && (
              <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center text-xs text-gray-400">
                Loading more...
              </div>
            )}
          </div>
          :
          <div className="w-full h-full flex-center flex-col gap-4 py-10">
            <Image
              alt="compose music image"
              src="/illustration/happyMusic.svg"
              width={200}
              height={200}
            />
            {showSelectedOnly ? (
              <>
                <p className="text-xl font-semibold">No songs selected</p>
                <p className="text-muted-foreground">Add songs from the list to see them here.</p>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold">No songs found</p>
                <p className="text-muted-foreground">Try searching for something else or add new songs.</p>
              </>
            )}
          </div>
      }
    </div>
  )
}
