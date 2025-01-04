"use client"

import {NoticeList} from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-list";

export default function NoticePage({params}: any) {
  const teamId = params.teamId
  return (
    <div className="w-full h-full flex justify-center">
      <NoticeList teamId={teamId}/>
    </div>
  )
}
