
// Placeholder page

import {SongList} from "@/app/board/[teamId]/(song)/song-board/_components/song-list";

interface Props {
  params: any
}

export default function SongPage({params}: Props) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col items-center">
      <SongList teamId={teamId}/>
    </div>
  )
}
