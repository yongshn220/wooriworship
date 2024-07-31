"use client"

import {Textarea} from "@/components/ui/textarea";
import {useMemo} from "react";
import {useRecoilState} from "recoil";
import {selectedWorshipSongWrapperListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {toPlainObject} from "@/components/helper/helper-functions";
import {SongListItem, ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {SwapOrderButton} from "@/app/board/[teamId]/plan/_components/swap-order-button";
import {WorshipSongWrapper} from "@/components/constants/types";
import {
  SelectSongDetailCardWrapper
} from "@/app/worship/[teamId]/[worshipId]/_components/select-song-detail-card-wrapper";
import {WorshipSongPreviewItem} from "@/app/worship/[teamId]/[worshipId]/_components/worship-song-preview-item";

interface Props {
  teamId: string
  songOrder: number
  songWrapper: WorshipSongWrapper
}

export function NewSongCard({teamId, songOrder, songWrapper}: Props) {
  const [selectedSongWrapperList, setSelectedSongWrapperList] = useRecoilState(selectedWorshipSongWrapperListAtom)

  const currentSongInfo = useMemo(() => (selectedSongWrapperList.find((_songWrapper => _songWrapper.song.id === songWrapper.song.id))), [selectedSongWrapperList, songWrapper.song.id])

  if (!currentSongInfo.song) return <></>

  function handleRemoveSong() {
    setSelectedSongWrapperList(selectedSongWrapperList.filter((_songWrapper) => _songWrapper.song.id != currentSongInfo.song.id))
  }

  function handleOnNoteChange(input: string) {
    const newSongInfoList = toPlainObject(selectedSongWrapperList)
    newSongInfoList.forEach((_songWrapper: WorshipSongWrapper) => {
      if (_songWrapper.song.id === songWrapper.song.id) {
        _songWrapper.note = input
      }
    })
    setSelectedSongWrapperList(newSongInfoList)
  }

  function setWorshipSongSelectedKeys(selectedKeys: Array<string>) {
    const targetSongWrapper = selectedSongWrapperList.find((wrapper => wrapper?.song?.id === songWrapper?.song?.id))
    if (!targetSongWrapper) {
      console.log("err: setWorshipSongSelectedKeys, there is no such song id.")
    }

    setSelectedSongWrapperList((prev) => ([
      ...prev.filter(wrapper => wrapper?.song?.id !== songWrapper?.song?.id),
      {...targetSongWrapper, selectedKeys: selectedKeys}
    ]))
  }

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full h-64 border shadow-sm rounded-md p-2 gap-4 bg-white">
        <SelectSongDetailCardWrapper
          teamId={teamId}
          songId={songWrapper?.song?.id}
          selectedKeys={songWrapper?.selectedKeys}
          setSelectedKeys={(selectedKeys: string[]) => setWorshipSongSelectedKeys(selectedKeys)}
        >
          <WorshipSongPreviewItem songId={songWrapper?.song?.id} selectedKeys={songWrapper?.selectedKeys} customTags={[]}/>
        </SelectSongDetailCardWrapper>
        <div className="absolute flex-center -translate-y-1/2 -right-4">
          <SwapOrderButton songWrapper={songWrapper} songOrder={songOrder}/>
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
