"use client"

import React, {Suspense} from "react";
import {TeamIdValidation} from "@/app/board/_components/auth/teamid-validation";
import {FallbackText} from "@/components/fallback-text";
import {InitPage} from "@/app/board/[teamId]/_components/init-page";
import {usePathname} from "next/navigation";


interface Props {
  params: any,
  children: any
}

export default function BoardTeamLayout({params, children}: Props) {
  const teamId = params.teamId
  const pathname = usePathname()
  console.log(pathname)
  return (
    <div className="w-full h-full">
      <Suspense fallback={<FallbackText text="Loading..."/>}>
        <TeamIdValidation teamId={teamId}>
          {children}
        </TeamIdValidation>
      </Suspense>
    </div>
  )
}
