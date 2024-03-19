"use client"
import {Button} from "@/components/ui/button";
import {MainLogo} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {Label} from "@/components/ui/label";
import {useEffect, useState} from "react";
import Link from "next/link";
import {LayoutDashboard, LibraryBig} from "lucide-react";
import Image from "next/image";
import {StartWorshipButton} from "@/app/worship/[id]/_components/worship-sidebar/start-worship-button";

const songs = [
  {id: "1", title: "내 주를 가까이 G"},
  {id: "2", title: "나의 소망 되신 주 A"},
  {id: "3", title: "오직 예수 A"},
  {id: "4", title: "빛 되신 주 G"},
]

export function WorshipSidebar() {
  const [selectedSongId, setSelectedSongId] = useState(songs[0].id)

  return (
    <MdSidebar>
      <MainLogo/>
      <div className="flex-between flex-col h-full">
        <div className="space-y-2 w-full ">
          <Label>Songs</Label>
          {
            songs.map((song) => (
              <Button
                key={song.id}
                variant={(selectedSongId === song.id)? "secondary" : "ghost"}
                size="lg"
                className="w-full justify-start px-2 font-semibold"
                onClick={() => setSelectedSongId(song.id)}
              >
                {song.title}
              </Button>
            ))
          }
          <div className="w-full flex-start flex-col gap-2 pt-5">
            <Image
              alt="compose music image"
              src="/composeMusic.svg"
              width={80}
              height={80}
              className=""
            />
            <StartWorshipButton/>
          </div>
        </div>
        <div className="mb-5">
          <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
            <Link href={"/board"}>
              <LayoutDashboard className="h-4 w-4 mr-2"/>
              Worship Plan
            </Link>
          </Button>
          <Button variant="ghost" asChild size="lg" className="font-normal w-full justify-start px-2">
            <Link href={{
              pathname: "/",
              query: {favorites: true}
            }}>
              <LibraryBig className="h-4 w-4 mr-2"/>
              Song Board
            </Link>
          </Button>
        </div>
      </div>
    </MdSidebar>
  )
}
