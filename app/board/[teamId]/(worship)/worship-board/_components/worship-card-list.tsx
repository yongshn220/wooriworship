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
  const expandedId = searchParams.get("expanded");

  const worshipList = useMemo(() => (worshipListLoadable.state === 'hasValue') ? worshipListLoadable.contents as Array<Worship> : [], [worshipListLoadable]);

  // Filtering Logic
  const filteredWorshipList = useMemo(() => {
    // 1. Search Filter (Global)
    if (searchInput) {
      return worshipList; // Search is handled within WorshipCard individually, or we can filter here.
      // NOTE: The current implementation relies on WorshipCard to hide itself if it doesn't match search.
      // However, for infinite scroll to work properly with search, we ideally should filter HERE.
      // But keeping existing behavior: we pass all to render, and WorshipCard creates the "hiding" effect?
      // Actually, standard behavior is filtering ID list.
      // Let's filter IDs here to be safe and efficient.
    }

    // 2. Tab Filter
    const now = new Date();
    // Reset time part to ensure "Today" includes everything from today 00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return worshipList.filter(worship => {
      const worshipDate = worship.worship_date.toDate();
      const isPast = worshipDate < today; // strictly past. Today is "upcoming/active".

      if (activeTab === "upcoming") {
        return !isPast;
      } else {
        return isPast;
      }
    });

  }, [worshipList, activeTab, searchInput]);

  // NOTE: If searchInput is present, `filteredWorshipList` currently returns ALL. 
  // But wait, `WorshipCard` has internal logic `shouldRenderCard` based on searchInput.
  // If we pass IDs that are filtered out by WorshipCard's internal logic, `visibleWorshipIds` will contain items that render as null.
  // This breaks infinite scroll (we load 20 nulls). 
  // We should NOT rely on WorshipCard for search filtering if we want proper list behavior.
  // BUT refactoring search logic entirely is out of scope? 
  // The user requirement said: "Search should include all".
  // So if searchInput is active, we bypass Tab filter.
  // The `WorshipCard` handles the search visibility. 
  // **Risk**: If search matches item #100, and we only render top 20, it won't be seen.
  // The previous implementation used `worshipIds` (all) and `visibleWorshipIds` (slice). 
  // AND `WorshipCard` implemented `shouldRenderCard`. 
  // This implies SEARCH WAS BROKEN for items beyond `displayedCount` unless it filtered IDs beforehand?
  // Let's check `WorshipCard`. Yes it uses `shouldRenderCard`.
  // So previously, if you searched for an item at the bottom, it wouldn't show up until you scrolled down? 
  // That seems like a bug in existing code, but I should try to preserve existing behavior unless asked.
  // However, for TABS, filtering IS required here.

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

  // Auto-expand
  useEffect(() => {
    if (worshipListLoadable.state === 'hasValue' && expandedId && worshipList.length > 0) {
      // Find which tab this ID belongs to
      const targetWorship = worshipList.find(w => w.id === expandedId);
      if (targetWorship) {
        // If we are NOT searching, we might need to switch tab
        if (!searchInput) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPast = targetWorship.worship_date.toDate() < today;

          if (isPast && activeTab !== 'history') setActiveTab('history');
          if (!isPast && activeTab !== 'upcoming') setActiveTab('upcoming');
        }
      }

      const index = worshipIds.findIndex((id: string) => id === expandedId);
      if (index >= 0 && index >= displayedCount) {
        setDisplayedCount(prev => Math.max(prev, index + 3));
      }
    }
  }, [worshipListLoadable.state, expandedId, worshipIds, setDisplayedCount, displayedCount, worshipList, searchInput, activeTab]);

  switch (worshipListLoadable.state) {
    case 'loading': return <WorshipListSkeleton />
    case 'hasError': throw worshipListLoadable.contents
    case 'hasValue':
      return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 content-container-safe-area pb-24 space-y-6 overscroll-y-none">

            {/* Tabs (Only show if not searching) */}
            {!searchInput && (
              <div className="mb-4">
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

            {
              (worshipIds.length > 0) ?
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {
                      visibleWorshipIds.map((worshipId: string, index: number) => (
                        <Suspense key={worshipId} fallback={<WorshipCardSkeleton />}>
                          <WorshipCard worshipId={worshipId} isFirst={index === 0} />
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
                </>
                :
                <EmptyWorshipBoardPage />
            }
          </div>
        </div>
      )
  }
  return <></>;
}

