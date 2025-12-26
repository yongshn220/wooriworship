"use client"

import { NoticeHeaderList } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-header-list";
import { Suspense } from "react";
import { NoticeListSkeleton } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-list-skeleton";

export default function NoticePage({ params }: any) {
  const teamId = params.teamId
  return (
    <div className="w-full h-full flex justify-center">
      <Suspense fallback={<NoticeListSkeleton />}>
        <NoticeHeaderList teamId={teamId} />
      </Suspense>
    </div>
  )
}
