import React, { Suspense, useEffect, useRef, useMemo } from "react";
import { currentTeamWorshipIdsAtom, currentTeamWorshipListAtom, worshipListDisplayedCountAtom } from "@/global-states/worship-state";
import { WorshipCard } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card";
import { EmptyWorshipBoardPage } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/empty-worship-board-page";
import { useRecoilValueLoadable, useRecoilState, useRecoilValue } from "recoil";
import { useSearchParams } from "next/navigation";
import { WorshipListSkeleton, WorshipCardSkeleton } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-list-skeleton";
import { planSearchInputAtom } from "@/app/board/_states/board-states";
import { Worship } from "@/models/worship";

import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/segmented-control";


interface Props {
  teamId: string
}

export function WorshipCardList({ teamId }: Props) {
  const worshipListLoadable = useRecoilValueLoadable(currentTeamWorshipListAtom(teamId));
  const searchInput = useRecoilValue(planSearchInputAtom);

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "history">("upcoming");

  // Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useRecoilState(worshipListDisplayedCountAtom);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  // const expandedId = searchParams.get("expanded"); // REMOVED

  const worshipList = useMemo(() => (worshipListLoadable.state === 'hasValue') ? worshipListLoadable.contents as Array<Worship> : [], [worshipListLoadable]);

  // Filtering Logic
  const filteredWorshipList = useMemo(() => {
    // 1. Search Filter (Global)
    if (searchInput) {
      // Sort by date DESC for search
      return [...worshipList].sort((a, b) => {
        const dateA = a.worship_date.toDate().getTime();
        const dateB = b.worship_date.toDate().getTime();
        return dateB - dateA;
      });
    }

    // 2. Tab Filter
    const now = new Date();
    // Reset time part to ensure "Today" includes everything from today 00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = worshipList.filter(worship => {
      const worshipDate = worship.worship_date.toDate();
      const isPast = worshipDate < today; // strictly past. Today is "upcoming/active".

      if (activeTab === "upcoming") {
        return !isPast;
      } else {
        return isPast;
      }
    });

    // 3. Sorting
    return filtered.sort((a, b) => {
      const dateA = a.worship_date.toDate().getTime();
      const dateB = b.worship_date.toDate().getTime();

      if (activeTab === "upcoming") {
        return dateA - dateB; // ASC for upcoming
      } else {
        return dateB - dateA; // DESC for history
      }
    });

  }, [worshipList, activeTab, searchInput]);

  const worshipIds = useMemo(() => filteredWorshipList.map(w => w.id as string), [filteredWorshipList]);
  const visibleWorshipIds = worshipIds.slice(0, displayedCount);

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
  }, [worshipIds, setDisplayedCount]);

  // Auto-expand removed


  switch (worshipListLoadable.state) {
    case 'loading': return <WorshipListSkeleton />
    case 'hasError': throw worshipListLoadable.contents
    case 'hasValue':
      const isGlobalEmpty = worshipList.length === 0;
      const isEmpty = worshipIds.length === 0;

      // 1. Global Empty State (No plans at all)
      if (isGlobalEmpty) {
        return (
          <div className="flex flex-col h-full w-full bg-background relative">
            {/* Hide tabs on global empty to avoid confusion, or show them? 
                User said: "worship board 에서 history 가 없으면 history 가 없다고 나와야하는데"
                If global is empty, there is no history AND no upcoming.
                So Global Empty Page is correct here.
             */}
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyWorshipBoardPage />
            </div>
          </div>
        )
      }

      // 2. Filtered Empty State (Has plans, but none match filter)
      if (isEmpty) {
        return (
          <div className="flex flex-col h-full w-full bg-muted/30 relative">
            {!searchInput && (
              <div className="px-4 md:px-6 pt-4 md:pt-6 w-full z-10">
                <SegmentedControl
                  value={activeTab}
                  onChange={(val) => setActiveTab(val)}
                  options={[
                    { label: "Upcoming", value: "upcoming" },
                    { label: "History", value: "history" },
                  ]}
                />
              </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 opacity-60">
              {searchInput ? (
                <p>No results found for &quot;{searchInput}&quot;</p>
              ) : activeTab === 'history' ? (
                <>
                  <p className="font-semibold">No past worship plans</p>
                  <p className="text-sm">Past services will appear here.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">No upcoming worship plans</p>
                  <p className="text-sm">Create a new plan to get started.</p>
                </>
              )}
            </div>
          </div>
        )
      }

      return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
          <div className="flex-1 overflow-y-auto content-container-safe-area pb-24 overscroll-y-none flex flex-col">

            {/* Tabs (Only show if not searching) */}
            {!searchInput && (
              <div className="px-4 md:px-6 pt-4 md:pt-6 mb-4">
                <SegmentedControl
                  value={activeTab}
                  onChange={(val) => setActiveTab(val)}
                  options={[
                    { label: "Upcoming", value: "upcoming" },
                    { label: "History", value: "history" },
                  ]}
                />
              </div>
            )}

            <div className="px-4 md:px-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {
                  visibleWorshipIds.map((worshipId: string, index: number) => (
                    <Suspense key={worshipId} fallback={<WorshipCardSkeleton />}>
                      <WorshipCard
                        worshipId={worshipId}
                        isFirst={index === 0}
                        defaultExpanded={activeTab === 'upcoming'}
                      />
                    </Suspense>
                  ))
                }
              </div>
              {/* Load More Trigger */}
              {visibleWorshipIds.length < worshipIds.length && (
                <div ref={loadMoreRef} className="h-20 w-full flex-center py-4 text-muted-foreground text-sm">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        </div>
      )
  }
  return <></>;
}

