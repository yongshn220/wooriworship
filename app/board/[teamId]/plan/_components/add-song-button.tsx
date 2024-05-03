'use client'

import {Dialog, DialogClose, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";
import SongService from "@/apis/SongService";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {Song} from "@/models/song";
import {Button} from "@/components/ui/button";
import {SongSelectCardList} from "@/app/board/[teamId]/plan/_components/song-select-card-list";

export function AddSongButton() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [songList, setSongList] = useState<Array<Song>>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    SongService.getTeamSong(teamId).then(songList => {
      setSongList(songList as Array<Song>)
    })
  }, [teamId])

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
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <SongSelectCardList searchInput={input} songList={songList}/>
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
