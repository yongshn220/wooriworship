import React, { Suspense, useEffect, useRef } from "react";
import { currentTeamWorshipIdsAtom, worshipListDisplayedCountAtom } from "@/global-states/worship-state";
import { WorshipCard } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card";
import { EmptyWorshipBoardPage } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/empty-worship-board-page";
import { useRecoilValueLoadable, useRecoilState } from "recoil";
import { useSearchParams } from "next/navigation";


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

  const worshipIds = (worshipIdsLoadable.state === 'hasValue') ? worshipIdsLoadable.contents : [];
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [worshipIds]);

  // Auto-expand list to include target if expanded param exists
  useEffect(() => {
    if (worshipIdsLoadable.state === 'hasValue' && expandedId && worshipIds.length > 0) {
      const index = worshipIds.findIndex(id => id === expandedId);
      if (index >= 0 && index >= displayedCount) {
        // Load enough to show the target item + a few more
        setDisplayedCount(prev => Math.max(prev, index + 3));
      }
    }
  }, [worshipIdsLoadable.state, expandedId, worshipIds, setDisplayedCount, displayedCount]);

  switch (worshipIdsLoadable.state) {
    case 'loading': return <></>
    case 'hasError': throw worshipIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          {
            (worshipIds.length > 0) ?
              <>
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 grid-flow-row-dense grid-rows-[auto]">
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
      )
  }
  return <></>;
  // Fallback if needed, though switch covers cases provided the state is valid. 
  // Typescript might complain if switch isn't exhaustive? Recoil Loadable state is 'loading' | 'hasValue' | 'hasError'.
}

function WorshipCardSkeleton() {
  return (
    <div className="w-full h-[400px] border rounded-lg p-4 space-y-4 bg-card animate-pulse">
      <div className="w-2/3 h-6 bg-muted rounded"></div>
      <div className="w-1/2 h-4 bg-muted rounded"></div>
      <div className="w-full h-40 bg-muted/50 rounded-md"></div>
      <div className="space-y-2">
        <div className="w-full h-4 bg-muted rounded"></div>
        <div className="w-5/6 h-4 bg-muted rounded"></div>
      </div>
    </div>
  )
}
