"use client"

import {Dialog, DialogContentNoCloseButton, DialogTitle} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/util/helper/routes";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {
  WorshipLiveCarousel
} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/worship-view/_components/worship-live-carousel";
import {
  WorshipLiveMenu
} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/worship-view/_components/worship-live-menu";
import {
  WorshipIndexIndicator
} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/worship-view/_components/worship-index-indicator";


export default function WorshipLivePage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const router = useRouter()

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      router.replace(getPathWorship(teamId, worshipId))
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContentNoCloseButton className="flex-center w-full max-w-8xl h-full p-0">
        <VisuallyHidden>
          <DialogTitle>Worship Live Page</DialogTitle>
        </VisuallyHidden>
        <WorshipLiveCarousel worshipId={worshipId}/>
        <WorshipLiveMenu teamId={teamId} worshipId={worshipId}/>
        <WorshipIndexIndicator/>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
