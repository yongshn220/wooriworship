"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";
import {usePathname} from "next/navigation";

export default function PlanLayout({children}: any) {
  const pathname = usePathname()
  console.log(pathname)

  return (
    <PullToRefresh>
      {children}
    </PullToRefresh>
  )
}
