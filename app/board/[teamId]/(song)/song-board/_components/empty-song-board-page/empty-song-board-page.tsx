import Image from "next/image";
import { NewSongButton } from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/new-song-button";
import * as React from "react";


export function EmptySongBoardPage() {
  return (
    <div className="w-full flex-1 flex-center flex-col gap-4 bg-background">
      <Image
        alt="compose music image"
        src="/illustration/happyMusic.svg"
        width={200}
        height={200}
      />
      <p className="text-3xl font-bold tracking-tight text-foreground">Song Board is empty</p>
      <p className="text-muted-foreground">Click &ldquo;Add Song&rdquo; button to get started</p>
      <NewSongButton />
    </div>
  )
}
