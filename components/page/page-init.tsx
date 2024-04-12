'use client'

import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/app/board/_states/pageState";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";
import {currentTeamIdAtom} from "@/global-states/teamState";

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
