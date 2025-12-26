import { SongList } from "@/app/board/[teamId]/(song)/song-board/_components/song-list";
import { Suspense } from "react";
import { SongListSkeleton } from "@/app/board/[teamId]/(song)/song-board/_components/song-list-skeleton";

interface Props {
  params: any
}

export default function SongPage({ params }: Props) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col items-center">
      <Suspense fallback={<SongListSkeleton />}>
        <SongList teamId={teamId} />
      </Suspense>
    </div>
  )
}
