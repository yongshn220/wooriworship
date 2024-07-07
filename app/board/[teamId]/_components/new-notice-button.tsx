import {Button} from "@/components/ui/button";
import React, {Suspense, useState} from "react";
import {NoticeForm} from "@/app/board/[teamId]/_components/notice-form";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {FormMode} from "@/components/constants/enums";


export function NewNoticeButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)

  return (
    <div>
      <Suspense>
        <NoticeForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen}/>
      </Suspense>
      <Button disabled={!teamId} className="bg-blue-500 hover:bg-blue-400" onClick={() => setIsOpen(prev => !prev)}>
        + Add Notice
      </Button>
    </div>
  )
}
