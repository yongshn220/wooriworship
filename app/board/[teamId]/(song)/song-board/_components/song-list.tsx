"use client"
import { useRecoilValue } from "recoil";
import { currentTeamSongIdsAtom } from "@/global-states/song-state";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { EmptySongBoardPage } from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/empty-song-board-page";
import { SongCard } from "./song-card";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="w-full h-full p-2 sm:p-4 md:p-6 ml-0 sm:ml-4">
      {/* Header Row for Desktop */}
      <div className="hidden md:flex items-center px-6 py-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="flex-1 pl-4">Title</div>
        <div className="w-32 shrink-0 text-center">Key</div>
      </div>

      <div className="flex flex-col space-y-2">
        {
          visibleSongIds.map((songId, index) => (
            <Suspense key={songId} fallback={<SongRowSkeleton />}>
              <SongCard teamId={teamId} songId={songId} index={index % 20} />
            </Suspense>
          ))
        }
      </div>

      {/* Load More Trigger */}
      {visibleSongIds.length < songIds.length && (
        <div ref={loadMoreRef} className="h-24 w-full flex justify-center items-center py-8">
          <div className="flex gap-2 items-center text-gray-400 text-sm font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animation-delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animation-delay-150"></div>
          </div>
        </div>
      )}
    </div>
  )
}

function SongRowSkeleton() {
  return (
    <div className="relative rounded-xl bg-white border border-gray-100 shadow-sm p-3 sm:px-6 sm:py-3.5 flex items-center gap-4 h-[72px]">
      {/* Title Placeholder */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
      </div>
      {/* Key Placeholder */}
      <div className="w-32 flex justify-center gap-1">
        <div className="h-5 w-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
