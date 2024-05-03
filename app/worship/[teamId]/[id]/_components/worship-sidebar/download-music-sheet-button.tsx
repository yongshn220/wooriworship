import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {DownloadIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";

const songs = [
  "내 주를 가까이",
  "나의 소망 되신 주",
  "오직 예수",
  "빛 되신 주"
]

export function DownloadMusicSheetButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 pl-0">
          <DownloadIcon size={20} className=""/>
          <p>Download</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full flex-start flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download music sheets</DialogTitle>
          <DialogDescription>Select songs you want to download.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 mt-5">
          {
            songs.map((song, index) => (
              <div key={index} className="flex items-center space-x-5">
                <Checkbox id={song + index}/>
                <label htmlFor={song + index} className="font-medium cursor-pointer">
                  {song}
                </label>
              </div>
            ))
          }
        </div>
        <div className="w-full flex-center space-x-4">
          <Button variant="outline" className="cursor-pointer">Select All</Button>
          <Button className="cursor-pointer">Download</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
