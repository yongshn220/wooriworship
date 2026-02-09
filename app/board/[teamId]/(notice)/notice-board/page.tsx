"use client"

import { NoticeHeaderList } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-header-list";
import { Suspense, useEffect } from "react";
import { NoticeListSkeleton } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-list-skeleton";
import { TodoBoard } from "@/components/elements/design/todo";
import { ContentContainer } from "@/components/common/layout/content-container";

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
    <div className="flex flex-col min-h-full bg-surface dark:bg-surface-dark relative">
      {tab === "announcements" ? (
        <div className="flex-1">
          <ContentContainer className="pt-2 space-y-5 pb-24">
            <Suspense fallback={<NoticeListSkeleton />}>
              <NoticeHeaderList teamId={teamId} />
            </Suspense>
          </ContentContainer>
        </div>
      ) : (
        <ContentContainer className="flex-1 min-h-0 w-full">
          <TodoBoard teamId={teamId} />
        </ContentContainer>
      )}
    </div>
  );
}
