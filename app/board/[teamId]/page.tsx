"use client"

import {NoticePreview} from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-preview";
import {WorshipBoardPreview} from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-board-preview";

export default function BoardHomePage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex-center">
      <div className="flex flex-col w-full h-full gap-6">
        <NoticePreview teamId={teamId}/>
        <WorshipBoardPreview teamId={teamId}/>
      </div>
    </div>
  )
}
