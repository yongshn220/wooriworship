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

import { AlphabetIndexer } from "./alphabet-indexer";
import { ActiveFilterList } from "@/app/board/_components/active-filter-list";

// ... existing imports

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

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [songIds]);

  /* ----------------------------------------------------
     * Scroll Sync Logic (List -> Indexer)
     * ---------------------------------------------------- */
  const [activeIndex, setActiveIndex] = useState(0);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector('main') as HTMLElement; // Based on BoardLayout
    if (!scrollContainer) return;

    let ticking = false;

    const handleScroll = () => {
      // If we are scrolling because of a click on the indexer, don't update the active char
      // This prevents the indexer from "jumping back" while the list is traveling to the target
      if (isProgrammaticScroll.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Find the first visible item
          const containerTop = scrollContainer.getBoundingClientRect().top;

          for (let i = 0; i < displayedCount; i++) {
            const el = document.getElementById(`song-row-${i}`);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            if (rect.bottom > containerTop + 50) {
              setActiveIndex(i);
              break;
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [displayedCount]);

  const handleScrollRequest = (index: number) => {
    // Set lock
    isProgrammaticScroll.current = true;
    if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current);

    // Release lock after enough time for scroll to settle (approx 1s)
    programmaticScrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);

    // 1. Ensure the item is rendered
    if (index >= displayedCount) {
      setDisplayedCount(index + 20); // Load enough to show it
    }

    // 2. Scroll to it (wait for render if needed)
    setTimeout(() => {
      const element = document.getElementById(`song-row-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50); // Small delay to allow React to commit changes
  };

  if (!songIds || songIds?.length <= 0) {
    return (<EmptySongBoardPage />)
  }

  return (
    <div className="w-full h-full p-2 sm:p-4 md:p-6 relative">
      <AlphabetIndexer teamId={teamId} onScrollRequest={handleScrollRequest} activeIndex={activeIndex} />

      {/* Active Filters */}
      <div className="px-6 mb-2">
        <ActiveFilterList />
      </div>

      {/* Header Row for Desktop */}
      <div className="hidden md:flex items-center px-6 py-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="flex-1 pl-4">Title</div>
        <div className="w-32 shrink-0 text-center">Key</div>
      </div>

      <div className="flex flex-col space-y-2">
        {
          visibleSongIds.map((songId, index) => (
            <div key={songId} id={`song-row-${index}`}>
              <Suspense fallback={<SongRowSkeleton />}>
                <SongCard teamId={teamId} songId={songId} index={index % 20} />
              </Suspense>
            </div>
          ))
        }
      </div>

      {/* Load More Trigger */}
      {visibleSongIds.length < songIds.length && (
        <div ref={loadMoreRef} className="h-24 w-full flex justify-center items-center py-8">
          <div className="flex gap-2 items-center text-muted-foreground text-sm font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            <div className="w-2 h-2 rounded-full bg-primary/60 animation-delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-primary/60 animation-delay-150"></div>
          </div>
        </div>
      )}
    </div>
  )
}

function SongRowSkeleton() {
  return (
    <div className="relative rounded-xl bg-card border border-border shadow-sm flex items-center h-[64px] sm:h-[100px] p-1 sm:p-5">
      {/* Left Column Skeleton */}
      <div className="flex-1 flex flex-col justify-between h-full py-0.5 sm:py-1 px-1">
        {/* Title + Subtitle */}
        <div className="flex items-center gap-2">
          <div className="h-4 sm:h-5 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-2.5 sm:h-3 bg-muted rounded w-1/5 animate-pulse"></div>
        </div>
        {/* Author */}
        <div className="h-2.5 sm:h-3 bg-muted rounded w-1/3 animate-pulse"></div>
        {/* Key */}
        <div className="h-3.5 sm:h-4 w-8 bg-muted rounded animate-pulse mt-auto"></div>
      </div>

      {/* Right Column Skeleton */}
      <div className="w-5 sm:w-10 flex justify-center items-center shrink-0 border-l border-border pl-0.5 sm:pl-3 h-2/3">
        <div className="h-4 w-4 sm:h-6 sm:w-6 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  )
}
