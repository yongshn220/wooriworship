"use client"
import {Button} from "@/components/ui/button";
import {MainLogo} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {Label} from "@/components/ui/label";
import {useState} from "react";
import Link from "next/link";
import {LayoutDashboard, LibraryBig} from "lucide-react";
import Image from "next/image";
import {StartWorshipButton} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/start-worship-button";
import {DownloadMusicSheetButton} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/download-music-sheet-button";
import {getPathPlan, getPathSong} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {currentSongListAtom} from "@/app/worship/[teamId]/[worshipId]/_states/states";


export function WorshipSidebar() {
  const songList = useRecoilValue(currentSongListAtom)
  const [selectedSongId, setSelectedSongId] = useState(songList[0]?.id?? [])
  const currentTeamId = useRecoilValue(currentTeamIdAtom)

  return (
    <div className="flex-between flex-col h-full">
      <div className="space-y-2 w-full ">
        <Label className="font-semibold">Songs</Label>
        {
          songList.map((song, i) => (
            <Button
              key={song.id}
              variant={(selectedSongId === song.id)? "secondary" : "ghost"}
              size="lg"
              className="w-full justify-start px-2 text-xs lg:text-sm overflow-hidden"
              onClick={() => setSelectedSongId(song.id)}
            >
              {`${i+1}. ${song.title}`}
            </Button>
          ))
        }
        <div className="w-full flex-start flex-col gap-4 pt-5">
          <Image
            alt="compose music image"
            src="/composeMusic.svg"
            width={80}
            height={80}
          />
          <DownloadMusicSheetButton/>
          <StartWorshipButton/>
        </div>
      </div>
      <div className="mb-5">
        <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathPlan(currentTeamId)}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Link>
        </Button>
        <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathSong(currentTeamId)}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Link>
        </Button>
      </div>
    </div>
  )
}
