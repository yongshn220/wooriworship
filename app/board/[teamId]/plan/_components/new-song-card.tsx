"use client"

import {Textarea} from "@/components/ui/textarea";
import {SongInfo} from "@/app/board/[teamId]/plan/_components/new-worship-button";
import {useMemo} from "react";
import {useRecoilState} from "recoil";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {toPlainObject} from "@/components/helper/helper-functions";
import {SongListItem, ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {SwapOrderButton} from "@/app/board/[teamId]/plan/_components/swap-order-button";

interface Props {
  teamId: string
  songOrder: number
  songInfo: SongInfo
}

export function NewSongCard({teamId, songOrder, songInfo}: Props) {
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
      <div className="relative flex flex-col w-full h-64 border shadow-sm rounded-md p-2 gap-4 bg-white">
        <SongDetailCardWrapper teamId={teamId} songId={songInfo?.song?.id}>
          <SongListItem songId={songInfo?.song?.id} viewMode={ViewMode.NONE}/>
        </SongDetailCardWrapper>
        <div className="absolute flex-center -translate-y-1/2 -right-4">
          <SwapOrderButton songId={songInfo?.song?.id} songOrder={songOrder}/>
        </div>

        <div className="w-full flex-1">
          <Textarea
            className="h-full bg-white"
            placeholder="Write a note for the song. (Update note in the Song Board to set as default)"
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
