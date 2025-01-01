"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";

export default function PlanLayout({children}: any) {

  return (
    <PullToRefresh>
      {children}
    </PullToRefresh>
  )
}
