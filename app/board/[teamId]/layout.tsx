"use client"

import React from "react";
import {TeamIdValidation} from "@/app/board/_components/auth/teamid-validation";


interface Props {
  params: any,
  children: any
}

export default function BoardTeamLayout({params, children}: Props) {
  const teamId = params.teamId

  return (
    <div>
      <TeamIdValidation teamId={teamId}>
        {children}
      </TeamIdValidation>
    </div>
  )
}
