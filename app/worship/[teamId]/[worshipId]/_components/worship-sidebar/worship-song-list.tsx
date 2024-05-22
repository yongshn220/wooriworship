import {Button} from "@/components/ui/button";
import {useRecoilValue} from "recoil";
import {worshipSongListAtom} from "@/global-states/worship-state";


interface Props {
  worshipId: string
}

export function WorshipSongList({worshipId}: Props) {
  const songList = useRecoilValue(worshipSongListAtom(worshipId))

  return (
    <div>
      {
        songList.map((song, i) => (
          <Button
            key={song.id}
            variant="ghost"
            size="lg"
            className="w-full justify-start px-2 text-xs lg:text-sm overflow-hidden"
          >
            {`${song.title}`}
          </Button>
        ))
      }
    </div>
  )
}
