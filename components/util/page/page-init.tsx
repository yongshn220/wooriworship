'use client'

import {useSetRecoilState} from "recoil";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";
import {currentTeamIdAtom} from "@/global-states/teamState";
import { currentPageAtom } from "@/global-states/page-state";

interface Props {
  teamId: string
  page: Page
}

export function PageInit({teamId, page}: Props) {
  const setCurrentPage = useSetRecoilState(currentPageAtom)
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)

  useEffect(() => {
    setCurrentPage(page)
    setCurrentTeamId(teamId)
  }, [setCurrentPage, setCurrentTeamId, teamId, page])

  return(<></>)
}
