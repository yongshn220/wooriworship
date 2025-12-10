
"use client"

import dynamic from "next/dynamic"
import { MainLogo } from "@/components/elements/util/logo/main-logo"

const RoutingIndicator = dynamic(
  () => import("@/components/util/animation/routing-indicator").then((mod) => mod.RoutingIndicator),
  { ssr: false }
)

export function RoutingPage() {
  return (
    <div className="flex-center w-full h-screen bg-white">
      <RoutingIndicator />
      <div className="absolute bottom-10">
        <MainLogo />
      </div>
    </div>
  )
}

