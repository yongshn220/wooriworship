
// Placeholder page

import {SongListView} from "@/app/board/[teamId]/(song)/song-board/_components/song-list-view";

interface Props {
  params: any
}

export default function SongPage({params}: Props) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col items-center">
      <SongListView teamId={teamId}/>
    </div>
  )
}
