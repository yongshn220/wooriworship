import {Button} from "@/components/ui/button";
import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {SongHeader} from "@/models/worship";
import {songAtom} from "@/global-states/song-state";


interface Props {
  worshipId: string
}

export function WorshipSongList({worshipId}: Props) {
  const worship = useRecoilValue(worshipAtom(worshipId))

  return (
    <div>
      {
        worship?.songs.map((songHeader, i) => (
          <WorshipSongItem key={i} songHeader={songHeader}/>
        ))
      }
    </div>
  )
}

function WorshipSongItem({songHeader}: {songHeader: SongHeader}) {
  const song = useRecoilValue(songAtom(songHeader?.id))

  return (
    <Button
      key={song?.id}
      variant="ghost"
      size="lg"
      className="w-full justify-start px-2 text-xs lg:text-sm overflow-hidden"
    >
      {`${song?.title}`}
    </Button>
  )
}
