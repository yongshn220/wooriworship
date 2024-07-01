"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";

export default function PlanLayout({children}) {
  return (
    <PullToRefresh>
      {children}
    </PullToRefresh>
  )
}
