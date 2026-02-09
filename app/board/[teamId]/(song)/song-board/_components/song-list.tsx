"use client"
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { currentTeamSongIdsAtom } from "@/global-states/song-state";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { EmptySongBoardPage } from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/empty-song-board-page";
import { SongCard } from "./song-card";
interface Props {
  teamId: string
}

import { AlphabetIndexer } from "./alphabet-indexer";
import { ActiveFilterList } from "@/app/board/_components/active-filter-list";
import { SongRowSkeleton } from "@/app/board/[teamId]/(song)/song-board/_components/song-list-skeleton";
import { songSearchInputAtom, searchSelectedTagsAtom, searchSelectedKeysAtom } from "@/app/board/_states/board-states";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollContainer } from "@/app/board/_contexts/scroll-container-context";
import { ContentContainer } from "@/components/common/layout/content-container";
import { Card } from "@/components/ui/card";

export function SongList({ teamId }: Props) {
  const scrollContainerRef = useScrollContainer()
  const songIds = useRecoilValue(currentTeamSongIdsAtom(teamId))
  const searchInput = useRecoilValue(songSearchInputAtom)
  const setSongSearch = useSetRecoilState(songSearchInputAtom)
  const [selectedTags, setSelectedTags] = useRecoilState(searchSelectedTagsAtom)
  const [selectedKeys, setSelectedKeys] = useRecoilState(searchSelectedKeysAtom)
  const isFiltering = (searchInput && searchInput !== "") || selectedTags.length > 0 || selectedKeys.length > 0

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
    const scrollContainer = scrollContainerRef?.current;
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
  }, [displayedCount, scrollContainerRef]);

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
    if (isFiltering) {
      // Empty search/filter results
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
          <SearchX className="w-10 h-10 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground font-medium">No songs match your search</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try different keywords or filters</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSongSearch("")
              setSelectedTags([])
              setSelectedKeys([])
            }}
          >
            Clear Filters
          </Button>
        </div>
      )
    }
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <EmptySongBoardPage />
      </div>
    )
  }

  return (
    <ContentContainer className="w-full h-full pt-2 pb-24 sm:pr-14 md:pr-16 relative">
      <AlphabetIndexer teamId={teamId} onScrollRequest={handleScrollRequest} activeIndex={activeIndex} />

      {/* Active Filters */}
      <div className="mb-2">
        <ActiveFilterList />
      </div>

      {/* Results Count (only when filtering) */}
      {isFiltering && (
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {songIds.length} {songIds.length === 1 ? 'song' : 'songs'} found
          </span>
        </div>
      )}

      <Card className="overflow-hidden shadow-sm divide-y divide-border" data-testid="song-list">
        {
          visibleSongIds.map((songId, index) => (
            <div key={songId} id={`song-row-${index}`}>
              <Suspense fallback={<SongRowSkeleton />}>
                <SongCard teamId={teamId} songId={songId} index={index % 20} />
              </Suspense>
            </div>
          ))
        }
      </Card>

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
    </ContentContainer>
  )
}

// function SongRowSkeleton() { ... } removed

