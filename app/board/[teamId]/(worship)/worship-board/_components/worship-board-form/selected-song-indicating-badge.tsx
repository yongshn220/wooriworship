import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {Badge} from "@/components/ui/badge";

interface Props {
  songId: string
}

export function SelectedSongIndicatingBadge({songId}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <Badge variant="outline">{song?.title}</Badge>
  )
}
