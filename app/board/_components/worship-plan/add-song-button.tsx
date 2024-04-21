'use client'

import {Dialog, DialogClose, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Plus, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useEffect, useMemo, useState} from "react";
import SongService from "@/apis/SongService";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {Song} from "@/models/song";
import {SongSelectCard} from "@/app/board/_components/worship-plan/song-select-card";
import {Button} from "@/components/ui/button";
import {selectedSongListAtom} from "@/app/board/_components/worship-plan/status";

export function AddSongButton() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [songList, setSongList] = useState<Array<Song>>([])
  const [selectedSongList, setSelectedSongList] = useRecoilState(selectedSongListAtom)

  useEffect(() => {
    SongService.getTeamSong(teamId).then(songList => {
      setSongList(songList as Array<Song>)
    })
  }, [teamId])

  const selectedSongIds = useMemo(() => selectedSongList.map((song) => song.id), [selectedSongList])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group w-full flex-center h-28 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
          <p className="text-gray-400 group-hover:text-gray-500">click to add song</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] h-4/6 overflow-y-scroll scrollbar-hide">
        <div className="w-full h-full mt-10">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-5 w-5"/>
            <Input
              className="w-full pl-11 py-6"
              placeholder="Search songs"
            />
          </div>
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 mt-10">
            {
              songList.map((song: Song) => (
                <SongSelectCard
                  key={song.id}
                  song={JSON.parse(JSON.stringify(song))}
                  isSelected={selectedSongIds.includes(song.id)}
                />
              ))
            }
          </div>
        </div>
        <DialogClose asChild>
          <div className="w-full flex-center">
            <Button className="w-[60px]">Done</Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
