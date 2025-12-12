'use client'

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { getPathCreatePlan } from "@/components/util/helper/routes";

export function NewWorshipButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  function handleClick() {
    // setIsOpen(true)
    router.push(getPathCreatePlan(teamId))
  }

  return (
    <Button disabled={!teamId} className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleClick}>
      + Add Worship
    </Button>
  )
}
