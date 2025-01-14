"use client"

import {NoticeHeaderList} from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-header-list";

export default function NoticePage({params}: any) {
  const teamId = params.teamId
  return (
    <div className="w-full h-full flex justify-center">
      <NoticeHeaderList teamId={teamId}/>
    </div>
  )
}
