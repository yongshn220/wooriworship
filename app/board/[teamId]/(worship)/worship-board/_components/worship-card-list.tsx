import React, { Suspense, useEffect, useRef, useMemo } from "react";
import { currentTeamWorshipIdsAtom, worshipListDisplayedCountAtom } from "@/global-states/worship-state";
import { WorshipCard } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card";
import { EmptyWorshipBoardPage } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/empty-worship-board-page";
import { useRecoilValueLoadable, useRecoilState } from "recoil";
import { useSearchParams } from "next/navigation";
import { WorshipListSkeleton, WorshipCardSkeleton } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-list-skeleton";


interface Props {
  teamId: string
}

export function WorshipCardList({ teamId }: Props) {
  const worshipIdsLoadable = useRecoilValueLoadable(currentTeamWorshipIdsAtom(teamId));

  // Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useRecoilState(worshipListDisplayedCountAtom);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const expandedId = searchParams.get("expanded");

  const worshipIds = useMemo(() => (worshipIdsLoadable.state === 'hasValue') ? worshipIdsLoadable.contents : [], [worshipIdsLoadable]);
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

  // Auto-expand list to include target if expanded param exists
  useEffect(() => {
    if (worshipIdsLoadable.state === 'hasValue' && expandedId && worshipIds.length > 0) {
      const index = worshipIds.findIndex((id: string) => id === expandedId);
      if (index >= 0 && index >= displayedCount) {
        // Load enough to show the target item + a few more
        setDisplayedCount(prev => Math.max(prev, index + 3));
      }
    }
  }, [worshipIdsLoadable.state, expandedId, worshipIds, setDisplayedCount, displayedCount]);

  switch (worshipIdsLoadable.state) {
    case 'loading': return <WorshipListSkeleton />
    case 'hasError': throw worshipIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 content-container-safe-area pb-24 space-y-6 overscroll-y-none">
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

