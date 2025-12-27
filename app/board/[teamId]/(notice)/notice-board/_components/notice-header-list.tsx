import { NoticeHeaderDefault } from "@/components/elements/design/notice/notice-header/notice-header-default";
import { useRecoilValue } from "recoil";
import { noticeIdsAtom } from "@/global-states/notice-state";
import { EmptyNoticeBoardPage } from "./empty-notice-board-page/empty-notice-board-page";
import React, { Suspense, useEffect, useRef, useState } from "react";

interface Props {
  teamId: string
}

export function NoticeHeaderList({ teamId }: Props) {
  const noticeIdList = useRecoilValue(noticeIdsAtom(teamId))

  // Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useState(5);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleNoticeIdList = noticeIdList.slice(0, displayedCount);

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
  }, [noticeIdList]);

  if (noticeIdList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background p-6">
        <EmptyNoticeBoardPage />
      </div>
    )
  }

  return (
    <div className="w-full items-center p-4">
      <div className="w-full flex-start flex-col gap-4">
        {
          visibleNoticeIdList.map((noticeId) => (
            <Suspense key={noticeId} fallback={<NoticeSkeleton />}>
              <NoticeHeaderDefault noticeId={noticeId} />
            </Suspense>
          ))
        }
      </div>
      {/* Load More Trigger */}
      {visibleNoticeIdList.length < noticeIdList.length && (
        <div ref={loadMoreRef} className="h-10 w-full flex-center py-4 text-muted-foreground text-sm">
          Loading more...
        </div>
      )}
    </div>
  )
}

function NoticeSkeleton() {
  return (
    <div className="w-full p-4 border border-border rounded-lg bg-card relative animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="w-32 h-4 bg-muted rounded"></div>
        <div className="w-8 h-8 rounded-full bg-muted"></div>
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-6 bg-muted rounded"></div>
        <div className="w-full h-4 bg-muted rounded"></div>
        <div className="w-full h-4 bg-muted rounded"></div>
        <div className="w-2/3 h-4 bg-muted rounded"></div>
      </div>
      <div className="w-24 h-4 bg-muted rounded mt-2"></div>
    </div>
  )
}
