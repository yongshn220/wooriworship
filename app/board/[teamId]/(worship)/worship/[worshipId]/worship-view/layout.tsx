"use client"

import {WorshipLivePreference} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/worship-view/_components/worship-live-preference";

export default function WorshipLiveLayout({children}: any) {
  return (
    <div className="w-full h-full">
      <WorshipLivePreference/>
      {children}
    </div>
  )
}
