"use client"
import { useRecoilValue } from "recoil";
import { currentTeamSongIdsAtom } from "@/global-states/song-state";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { SongDetailDialogTrigger } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import { SongHeaderDefault } from "@/components/elements/design/song/song-header/default/song-header-default";
import { EmptySongBoardPage } from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/empty-song-board-page";


interface Props {
  teamId: string
}

export function SongList({ teamId }: Props) {
  const songIds = useRecoilValue(currentTeamSongIdsAtom(teamId))

  // Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleSongIds = songIds ? songIds.slice(0, displayedCount) : [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => prev + 20);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [songIds]);

  if (!songIds || songIds?.length <= 0) {
    return (<EmptySongBoardPage />)
  }

  return (
    <div className="w-full h-full">
      <div>
        <div className="hidden md:flex text-sm text-gray-600 px-6 mt-10 font-semibold">
          <p className="flex-1">Title</p>
          <p className="hidden lg:flex flex-[0.4] justify-start border-l border-gray-300 pl-2">Version</p>
          <div className="hidden sm:flex justify-start sm:flex-1 text-start border-l border-gray-300 pl-2">Tag</div>
          <p className="flex justify-end lg:flex-[0.5] pl-2">Used on</p>
        </div>
      </div>
      <div className="flex-center flex-col mx-2 box-border">
        {
          visibleSongIds.map((songId) => (
            <div key={songId} className="w-full">
              <Suspense fallback={<SongRowSkeleton />}>
                <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                  <SongHeaderDefault songId={songId} />
                </SongDetailDialogTrigger>
              </Suspense>
              <Separator />
            </div>
          ))
        }
        {/* Load More Trigger */}
        {visibleSongIds.length < songIds.length && (
          <div ref={loadMoreRef} className="h-10 w-full flex-center py-4 text-gray-400 text-sm">
            Loading more...
          </div>
        )}
      </div>
    </div>
  )
}

function SongRowSkeleton() {
  return (
    <div className="w-full py-4 px-6 flex items-center justify-between animate-pulse">
      <div className="flex-1 h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="hidden md:block w-20 h-4 bg-gray-200 rounded ml-4"></div>
    </div>
  )
}
