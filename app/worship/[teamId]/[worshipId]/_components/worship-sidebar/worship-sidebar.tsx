"use client"
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Suspense, useEffect, useState} from "react";
import Link from "next/link";
import {DownloadIcon, LayoutDashboard, LibraryBig, PlusCircleIcon} from "lucide-react";
import Image from "next/image";
import {DownloadMusicSheetDialog} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/download-music-sheet-dialog";
import {getPathPlan, getPathSong, getPathWorshipStartMode} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";
import {WorshipSongList} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-song-list";

interface Props {
  teamId: string
  worshipId: string
}

export function WorshipSidebar({teamId, worshipId}: Props) {
  const router = useRouter()

  function handleStartWorship() {
    router.push(getPathWorshipStartMode(teamId, worshipId))
  }

  return (
    <div className="flex-between flex-col h-full">
      <div className="space-y-2 w-full ">
        <Label className="font-semibold">Songs</Label>
        <Suspense fallback={<div>loading..</div>}>
          <WorshipSongList worshipId={worshipId}/>
        </Suspense>
        <div className="w-full flex-start flex-col gap-4 pt-5">
          <Image
            alt="compose music image"
            src="/illustration/composeMusic.svg"
            width={80}
            height={80}
          />
          <DownloadMusicSheetDialog worshipId={worshipId}>
            <Button variant="outline" className="w-full gap-2 pl-0">
              <DownloadIcon size={20}/>
              <p>Download</p>
            </Button>
          </DownloadMusicSheetDialog>
          <Button className="w-full" onClick={handleStartWorship}>Start Worship</Button>
        </div>
      </div>
      <div className="mb-5">
        <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathPlan(teamId)}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Link>
        </Button>
        <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathSong(teamId)}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Link>
        </Button>
      </div>
    </div>
  )
}
