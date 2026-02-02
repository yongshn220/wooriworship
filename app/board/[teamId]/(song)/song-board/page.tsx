import { SongList } from "@/app/board/[teamId]/(song)/song-board/_components/song-list";
import { Suspense } from "react";
import { SongListSkeleton } from "@/app/board/[teamId]/(song)/song-board/_components/song-list-skeleton";
import { SongErrorBoundary } from "@/app/board/[teamId]/(song)/song-board/_components/song-error-boundary";

interface Props {
  params: { teamId: string }
}

export default function SongPage({ params }: Props) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col items-center">
      <SongErrorBoundary fallbackMessage="Failed to load songs. Please try again.">
        <Suspense fallback={<SongListSkeleton />}>
          <SongList teamId={teamId} />
        </Suspense>
      </SongErrorBoundary>
    </div>
  )
}
