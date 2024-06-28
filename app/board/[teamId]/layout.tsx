"use client"

import React, {Suspense} from "react";
import {TeamIdValidation} from "@/app/board/_components/auth/teamid-validation";
import {TestComponent} from "@/app/board/test-component";
import {FallbackText} from "@/components/fallback-text";


interface Props {
  params: any,
  children: any
}

export default function BoardTeamLayout({params, children}: Props) {
  const teamId = params.teamId
  console.log("-------BoardTeamLayout")
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
