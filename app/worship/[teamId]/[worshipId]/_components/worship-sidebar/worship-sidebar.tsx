"use client"
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {useState} from "react";
import Link from "next/link";
import {LayoutDashboard, LibraryBig} from "lucide-react";
import Image from "next/image";
import {DownloadMusicSheetButton} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/download-music-sheet-button";
import {getPathPlan, getPathSong, getPathWorshipStartMode} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";

interface Props {
  worshipId: string
}

export function WorshipSidebar({worshipId}: Props) {
  const worship = useRecoilValue(worshipAtom(worshipId))
  const songList = useRecoilValue(worshipSongListAtom(worshipId))
  const [selectedSongId, setSelectedSongId] = useState(songList[0]?.id?? [])
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  function handleStartWorship() {
    router.push(getPathWorshipStartMode(teamId, worship?.id))
  }

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
              {`${song.title}`}
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
          <DownloadMusicSheetButton worshipId={worshipId}/>
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
