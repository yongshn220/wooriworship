"use client"
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil";
import { currentTeamSongIdsAtom, songAtom } from "@/global-states/song-state";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import {
  AddableSongDetailDialogTrigger
} from "@/components/elements/design/song/song-detail-card/worship-form/addable-song-detail-dialog-trigger";
import { SongHeaderDefault } from "@/components/elements/design/song/song-header/default/song-header-default";
import { selectedWorshipSongHeaderListAtom } from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import {
  AddableSongHeaderDefault
} from "@/components/elements/design/song/song-header/worship-form/addable-song-header-default";

interface Props {
  teamId: string
}

export function AddableSongHeaderList({ teamId }: Props) {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))
  const [displayedCount, setDisplayedCount] = useState(20)
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => prev + 20)
        }
      },
      { threshold: 1.0 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [])

  switch (songIdsLoadable.state) {
    case 'loading': return <div className="w-full h-80 flex items-center justify-center text-gray-400">Loading songs...</div>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      const allSongIds = songIdsLoadable.contents || []
      const visibleSongIds = allSongIds.slice(0, displayedCount)

      return (
        <div className="w-full h-full pb-20">
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
                      <AddableSongHeaderDefault teamId={teamId} songId={songId} />
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
                <p className="text-xl font-semibold">No songs found</p>
                <p className="text-muted-foreground">Try searching for something else or add new songs.</p>
              </div>
          }
        </div>
      )
  }
}

