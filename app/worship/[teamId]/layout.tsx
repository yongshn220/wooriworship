"use client"

import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import {TeamIdValidation} from "@/app/board/_components/auth/teamid-validation";


export default function WorshipInitLayout({params, children}: any) {
  const teamId = params.teamId

  return (
    <BoardAuthenticate>
      <TeamIdValidation teamId={teamId}>
        {children}
      </TeamIdValidation>
    </BoardAuthenticate>
  )
}
