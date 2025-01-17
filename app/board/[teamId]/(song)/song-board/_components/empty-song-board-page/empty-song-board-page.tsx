import Image from "next/image";
import {NewSongButton} from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/new-song-button";
import * as React from "react";


export function EmptySongBoardPage() {
  return (
    <div className="w-full h-full flex-center flex-col gap-4 pt-10 bg-gray-50">
      <Image
        alt="compose music image"
        src="/illustration/happyMusic.svg"
        width={200}
        height={200}
      />
      <p className="text-3xl font-semibold">Song Board is empty</p>
      <p className="text-gray-500">Click &ldquo;Add Song&rdquo; button to get started</p>
      <NewSongButton/>
    </div>
  )
}
