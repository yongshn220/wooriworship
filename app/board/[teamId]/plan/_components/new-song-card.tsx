"use client"

import {Textarea} from "@/components/ui/textarea";
import {SongInfo} from "@/app/board/[teamId]/plan/_components/new-button";
import {useMemo} from "react";
import {useRecoilState} from "recoil";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {SwapOrderButton} from "@/app/board/[teamId]/plan/_components/swap-order-button";
import Image from "next/image";
import {toPlainObject} from "@/components/helper/helper-functions";

interface Props {
  index: number
  songInfo: SongInfo
}

export function NewSongCard({index, songInfo}: Props) {
  const [selectedSongInfoList, setSelectedSongInfoList] = useRecoilState(selectedSongInfoListAtom)

  const currentSongInfo = useMemo(() => (selectedSongInfoList.find((_songInfo => _songInfo.song.id === songInfo.song.id))), [selectedSongInfoList, songInfo.song.id])

  if (!currentSongInfo.song) return <></>

  function handleRemoveSong() {
    setSelectedSongInfoList(selectedSongInfoList.filter((_songInfo) => _songInfo.song.id != currentSongInfo.song.id))
  }

  function handleOnNoteChange(input: string) {
    const newSongInfoList = toPlainObject(selectedSongInfoList)
    newSongInfoList.forEach((_songInfo: SongInfo) => {
      if (_songInfo.song.id === songInfo.song.id) {
        _songInfo.note = input
      }
    })
    setSelectedSongInfoList(newSongInfoList)
  }

  return (
    <div className="w-full">
      <div className="relative flex-center flex-col w-full h-56 bg-gray-100 border-2 rounded-md p-2 gap-4">

        <div className="w-full flex h-28">
          <div className="absolute flex-center -translate-y-1/2 -right-4">
            <SwapOrderButton index={index}/>
          </div>
          {
            (currentSongInfo?.song?.music_sheet_urls?.length > 0) &&
            <div className="h-full flex-center flex-col">
              <div className="relative h-full w-full rounded-lg">
                <Image
                  src={currentSongInfo?.song?.music_sheet_urls[0]}
                  fill
                  sizes="20vw, 20vw, 20vw"
                  className="object-fill p-1 rounded-md"
                  alt="Music sheet image"
                />
              </div>
              <p className="text-xs text-gray-500">click to view</p>
            </div>
          }
          <div className="flex-1 h-full p-2 px-4">
            <div className="flex-between">
              <p className="font-semibold text-lg">{currentSongInfo?.song?.title}</p>
              <p className="text-sm text-gray-500">bpm {currentSongInfo?.song?.bpm.toString()}</p>
            </div>
            <p className="text-sm text-gray-600">{currentSongInfo?.song?.original.author}</p>
          </div>
        </div>

        <div className="w-full flex-1">
          <Textarea
            className="h-full bg-white"
            placeholder="Write a note for the song."
            value={currentSongInfo?.note}
            onChange={(e) => handleOnNoteChange(e.target.value)}
          />
        </div>

      </div>
      <div className="flex-end text-smnpx shadcn-ui@latest add dropdown-menu">
        <div className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm" onClick={() => handleRemoveSong()}>remove</div>
      </div>
    </div>
  )
}
