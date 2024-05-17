"use client"

import {SongCarouselFull} from "@/app/worship/[teamId]/[worshipId]/start-worship/_components/song-carousel-full";
import {WorshipViewMenu} from "@/app/worship/[teamId]/[worshipId]/start-worship/_components/worship-view-menu";
import {WorshipIndexIndicator} from "@/app/worship/[teamId]/[worshipId]/start-worship/_components/worship-index-indicator";
import {Dialog, DialogContent, DialogContentNoCloseButton} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/helper/routes";


export default function StartWorshipPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId
  const router = useRouter()

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      router.replace(getPathWorship(teamId, songId))
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContentNoCloseButton className="flex-center w-full max-w-8xl h-full p-0">
        <SongCarouselFull/>
        <WorshipViewMenu/>
        <WorshipIndexIndicator/>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
