import Image from "next/image";
import { NewSongButton } from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/new-song-button";
import * as React from "react";


export function EmptySongBoardPage() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <Image
        alt="Empty song board"
        src="/illustration/empty-song-plan-v2.png"
        width={300}
        height={300}
        className="mb-2"
        priority
      />
      <div className="space-y-2 max-w-sm">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Song Board is empty</h3>
        <p className="text-muted-foreground text-sm">
          Click &ldquo;Add Song&rdquo; button to get started and build your songs database.
        </p>
      </div>
      <div className="pt-2">
        <NewSongButton />
      </div>
    </div>
  )
}
