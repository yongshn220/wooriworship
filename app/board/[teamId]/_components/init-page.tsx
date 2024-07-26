import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {Page} from "@/components/constants/enums";

interface Props {
  children: any
  pathname: string
}


export function InitPage({children, pathname}: Props) {
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    const paths = pathname.split('/');
    const teamId = paths[2]
    const boardPage = paths[3]
    if (teamId) {
      setCurrentTeamId(teamId)
    }
    if (boardPage) {
      setPage(boardPage as Page)
    }
    else {
      setPage(Page.HOME)
    }
  }, [setCurrentTeamId, setPage, pathname])



  return (
    <>
      {children}
    </>
  )
}
