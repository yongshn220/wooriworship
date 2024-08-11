"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";

export default function SongLayout({children}: any) {

  return (
    <div className="w-full h-full">
      <PullToRefresh>
        {children}
      </PullToRefresh>
    </div>
  )
}

