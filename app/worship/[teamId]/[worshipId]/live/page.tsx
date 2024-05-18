"use client"

import {SongCarouselFull} from "@/app/worship/[teamId]/[worshipId]/live/_components/song-carousel-full";
import {WorshipLiveMenu} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-live-menu";
import {WorshipIndexIndicator} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-index-indicator";
import {Dialog, DialogContent, DialogContentNoCloseButton} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/helper/routes";


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
        <SongCarouselFull/>
        <WorshipLiveMenu teamId={teamId} worshipId={worshipId}/>
        <WorshipIndexIndicator/>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
