"use client"

import { NoticeHeaderList } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-header-list";
import { Suspense, useEffect } from "react";
import { NoticeListSkeleton } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-list-skeleton";
import { TodoBoard } from "@/components/elements/design/todo";

import { useRecoilState, useSetRecoilState } from "recoil";
import { noticeBoardTabAtom } from "@/app/board/_states/board-states";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";
import type { TabKey } from "./_components/notice-board-header";

export default function NoticePage({ params }: any) {
  const teamId = params.teamId;
  const [tab, setTab] = useRecoilState(noticeBoardTabAtom);
  const setCurrentPage = useSetRecoilState(currentPageAtom);

  // Set Page ID for Navbar
  useEffect(() => {
    setCurrentPage(Page.NOTICE_BOARD);
  }, [setCurrentPage]);

  // Reset tab on unmount
  useEffect(() => {
    return () => setTab("announcements");
  }, [setTab]);

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface-dark relative">
      {tab === "announcements" ? (
        <div className="flex-1">
          <div className="max-w-lg mx-auto px-4 pt-2 space-y-5 pb-24">
            <Suspense fallback={<NoticeListSkeleton />}>
              <NoticeHeaderList teamId={teamId} />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-lg mx-auto w-full px-4">
          <TodoBoard teamId={teamId} />
        </div>
      )}
    </div>
  );
}
