import Image from "next/image";
import { NewWorshipButton } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/new-worship-button";
import * as React from "react";

export function EmptyWorshipBoardPage() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <Image
        alt="Empty worship plan"
        src="/illustration/empty-worship-plan-v2.png"
        width={300}
        height={300}
        className="mb-2"
        priority
      />
      <div className="space-y-2 max-w-sm">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Worship Plan is empty</h3>
        <p className="text-muted-foreground text-sm">
          Click &ldquo;Add Worship&rdquo; button to get started and organize your upcoming services.
        </p>
      </div>
      <div className="pt-2">
        <NewWorshipButton />
      </div>
    </div>
  )
}
