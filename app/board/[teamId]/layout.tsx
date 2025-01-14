"use client"

import React, {Suspense, useEffect} from "react";
import {TeamIdValidation} from "@/app/board/_components/auth/teamid-validation";
import {FallbackText} from "@/components/util/text/fallback-text";
import {usePathname} from "next/navigation";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {Page} from "@/components/constants/enums";


interface Props {
  params: any,
  children: any
}

export default function BoardTeamLayout({params, children}: Props) {
  const teamId = params.teamId
  const pathname = usePathname()
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    if (/^\/board\/[^\/]+$/.test(pathname)) {
      setPage(Page.HOME)
    }
  }, [pathname, setPage])

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
