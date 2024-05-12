"use client"

import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {WorshipService} from "@/apis";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/helper/routes";
import {Mode} from "@/components/constants/enums";
import {Worship} from "@/models/worship";
import {useEffect, useState} from "react";

export default function EditWorshipPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const [worship, setWorship] = useState<Worship>(null)
  const router = useRouter()

  useEffect(() => {
    WorshipService.getById(worshipId).then(_worship => {
      setWorship(_worship as Worship)
    })
  }, [worshipId])

  function onOpenChangeHandler(state: boolean) {
    if (!state) {
      router.push(getPathWorship(teamId, worshipId))
    }
  }

  if (!worship) return <></>

  return (
    <WorshipForm mode={Mode.EDIT} isOpen={true} setIsOpen={onOpenChangeHandler} worship={worship} />
  )
}
