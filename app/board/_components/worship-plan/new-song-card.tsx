"use client"

import {Textarea} from "@/components/ui/textarea";
import {SongInfo} from "@/app/board/_components/worship-plan/new-button";
import {useEffect, useState} from "react";
import SongService from "@/apis/SongService";
import {Song} from "@/models/song";
import {useRecoilState} from "recoil";
import {selectedSongListAtom} from "@/app/board/_components/worship-plan/status";
import {SwapOrderButton} from "@/app/board/_components/worship-plan/swap-order-button";

interface Props {
  index: number
  songInfo: SongInfo
}

export function NewSongCard({index, songInfo}: Props) {
  const [selectedSongList, setSelectedSongList] = useRecoilState(selectedSongListAtom)
  const [song, setSong] = useState<Song | null>(null)

  useEffect(() => {
    if (!songInfo || !songInfo.id) return;

    SongService.getById(songInfo?.id).then((song) => {
      setSong(song as Song)
    })
  }, [songInfo])

  function handleRemoveSong() {
    setSelectedSongList(selectedSongList.filter((song) => song.id != songInfo.id))
  }

  return (
    <div className="w-full">
      <div className="relative flex-center flex-col w-full h-72 bg-gray-100 rounded-md p-2 gap-4">

        <div className="w-full flex h-28">
          <div className="absolute flex-center -translate-y-1/2 -right-4">
            <SwapOrderButton index={index}/>
          </div>
          <div className="h-full flex-center aspect-square bg-gray-300">
            <p>Score</p>
          </div>
          <div className="flex-1 h-full p-2 px-4">
            <div className="flex-between">
              <p className="font-semibold text-lg">{song?.title}</p>
              <p className="text-sm text-gray-500">bpm {song?.bpm.toString()}</p>
            </div>
            <p className="text-sm text-gray-600">{song?.original.author}</p>
          </div>
        </div>

        <div className="w-full flex-1">
          <Textarea
            className="h-full bg-white"
            placeholder="Write a note for the song."
          />
        </div>

      </div>
      <div className="flex-end text-smnpx shadcn-ui@latest add dropdown-menu
">
        <div className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => handleRemoveSong()}>remove</div>
      </div>
    </div>
  )
}
