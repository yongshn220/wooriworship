import Image from "next/image";
import { NewWorshipButton } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/new-worship-button";
import * as React from "react";

export function EmptyWorshipBoardPage() {
  return (
    <div className="w-full flex-1 flex-center flex-col gap-3 bg-background">
      <Image
        alt="compose music image"
        src="/illustration/teamworkIllustration.svg"
        width={300}
        height={300}
      />
      <p className="text-3xl font-bold tracking-tight text-foreground">Worship Plan is empty</p>
      <p className="text-muted-foreground">Click &ldquo;Add Worship&rdquo; button to get started</p>
      <NewWorshipButton />
    </div>
  )
}
