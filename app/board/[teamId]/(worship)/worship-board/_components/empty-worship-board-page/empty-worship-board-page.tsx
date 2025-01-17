import Image from "next/image";
import {NewWorshipButton} from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/new-worship-button";
import * as React from "react";

export function EmptyWorshipBoardPage() {
  return (
    <div className="w-full h-full flex-center flex-col gap-3 pt-10 bg-gray-50">
      <Image
        alt="compose music image"
        src="/illustration/teamworkIllustration.svg"
        width={300}
        height={300}
      />
      <p className="text-3xl font-semibold">Worship Plan is empty</p>
      <p className="text-gray-500">Click &ldquo;Add Worship&rdquo; button to get started</p>
      <NewWorshipButton/>
    </div>
  )
}
