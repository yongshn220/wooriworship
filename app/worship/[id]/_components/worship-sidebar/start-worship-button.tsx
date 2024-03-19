import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {SongCarouselFull} from "@/app/worship/[id]/_components/song-carousel-full";


export function StartWorshipButton() {

  function handleStartWorship() {

  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" onClick={handleStartWorship}>Start Worship</Button>
      </DialogTrigger>
      <DialogContent className="flex-center w-full max-w-8xl h-full p-0">
        <SongCarouselFull/>
      </DialogContent>
    </Dialog>
  )
}
