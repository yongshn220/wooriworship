import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {SongCarouselFull} from "@/app/worship/[id]/_components/song-carousel-full";
import Image from 'next/image'
import {Toggle} from "@/components/ui/toggle";

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
        <div className="absolute flex-center flex-col gap-y-2 right-5 bottom-5">
          <Image
            alt="squre up icon"
            src="/icons/noteIcon.svg"
            width={30}
            height={30}
          />
          <Image
            alt="squre up icon"
            src="/icons/squareUpIcon.svg"
            width={35}
            height={35}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
