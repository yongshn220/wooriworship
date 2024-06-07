"use client"

import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useRecoilValueLoadable} from "recoil";
import {teamAtom} from "@/global-states/teamState";


interface Props {
  teamId: string
  children: React.ReactNode
}

export function TeamIdValidation({teamId, children}: Props) {
  const teamLoadable = useRecoilValueLoadable(teamAtom(teamId))
  const router = useRouter()

  // TODO: 유저가 이 팀에 소속 되어있는지 확인 필요함. 없을 경우 redirect

  useEffect(() => {
    if (teamLoadable.state === 'hasError') {
      router.replace("/")
      return;
    }

    if (teamLoadable.state === 'hasValue' && teamLoadable.contents === null) {
      router.replace("/")
      return;
    }
  }, [router, teamLoadable]);


  return (
    <div className="h-full">
      {
        (teamLoadable.state === 'hasValue' && teamLoadable.contents?.id) && children
      }
    </div>
  )
}
