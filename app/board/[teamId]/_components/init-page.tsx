import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";

interface Props {
  pathname: string
}


export function InitPage({pathname}: Props) {
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)

  useEffect(() => {
    const paths = pathname.split('/');
    const teamId = paths[2]
    const boardPage = paths[3]
    if (teamId) {
      setCurrentTeamId(teamId)
    }
  }, [setCurrentTeamId, pathname])



  return (
    <>
    </>
  )
}
