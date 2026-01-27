import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Badge } from "@/components/ui/badge";

interface Props {
  teamId: string
  songId: string
}

export function SongTitleBadge({ teamId, songId }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))

  return (
    <Badge variant="outline">{song?.title}</Badge>
  )
}
