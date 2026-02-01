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
    <div className="w-full h-full flex flex-col">
      {/* Content Area */}
      <div className="flex-1 flex justify-center">
        {tab === "announcements" ? (
          <Suspense fallback={<NoticeListSkeleton />}>
            <NoticeHeaderList teamId={teamId} />
          </Suspense>
        ) : (
          <TodoBoard teamId={teamId} />
        )}
      </div>
    </div>
  );
}
