import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {SongCarouselFull} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel-full";
import {WorshipViewMenu} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-view-menu";
import {WorshipIndexIndicator} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-index-indicator";

export function StartWorshipButton() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Start Worship</Button>
      </DialogTrigger>
      <DialogContent className="flex-center w-full max-w-8xl h-full p-0">
        <SongCarouselFull/>
        <WorshipViewMenu/>
        <WorshipIndexIndicator/>
      </DialogContent>
    </Dialog>
  )
}
