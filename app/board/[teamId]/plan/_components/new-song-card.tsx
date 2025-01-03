"use client"

import {Textarea} from "@/components/ui/textarea";
import {useRecoilState, useRecoilValue} from "recoil";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {toPlainObject} from "@/components/helper/helper-functions";
import {SwapOrderButton} from "@/app/board/[teamId]/plan/_components/swap-order-button";
import {WorshipSongHeader} from "@/models/worship";
import {songAtom} from "@/global-states/song-state";
import {SelectSongDetailCardWrapper} from "@/app/board/[teamId]/song/_components/select-song-detail-card-wrapper";
import {SongPreviewItem} from "@/app/board/[teamId]/song/_components/song-preview-item";

interface Props {
  teamId: string
  songOrder: number
  songHeader: WorshipSongHeader
}

export function NewSongCard({teamId, songOrder, songHeader}: Props) {
  const [selectedSongHeaderList, setSelectedSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const song = useRecoilValue(songAtom(songHeader?.id))

  function handleRemoveSong() {
    setSelectedSongHeaderList(selectedSongHeaderList.filter((_header) => _header.id !== songHeader?.id))
  }

  function handleOnNoteChange(input: string) {
    const newSongInfoList = toPlainObject(selectedSongHeaderList)
    newSongInfoList.forEach((_songHeader: WorshipSongHeader) => {
      if (_songHeader?.id === songHeader?.id) {
        _songHeader.note = input
      }
    })
    setSelectedSongHeaderList(newSongInfoList)
  }

  function setMusicSheetIds(musicSheetIds: Array<string>) {
    const targetSongWrapper = selectedSongHeaderList.find((header => header?.id === songHeader?.id))
    if (!targetSongWrapper) {
      console.log("err: setMusicSheetIds, there is no such song id.")
    }

    setSelectedSongHeaderList((prev) => {
      const newList = JSON.parse(JSON.stringify(prev)) as Array<WorshipSongHeader>
      newList.forEach(_header => {
        if (_header?.id === songHeader?.id) {
          _header.selected_music_sheet_ids = musicSheetIds
        }
      })
      return newList
    })
  }

  function handleSelectSong() {
    if (isSongHeaderSelected()) {
      setSelectedSongHeaderList((prev) => ([...prev.filter((_header => _header?.id !== songHeader?.id))]))
    }
    else {
      setSelectedSongHeaderList((prev) => ([...prev, {
        id: song?.id,
        note: song?.description,
        selected_music_sheet_ids: songHeader?.selected_music_sheet_ids
      }]))
    }
  }

  function isSongHeaderSelected() {
    return selectedSongHeaderList?.map(songHeader => songHeader?.id)?.includes(songHeader?.id)
  }

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full h-64 border shadow-sm rounded-md p-2 gap-4 bg-white">
        <SelectSongDetailCardWrapper
          teamId={teamId}
          songId={songHeader?.id}
          selectedMusicSheetIds={songHeader?.selected_music_sheet_ids}
          setMusicSheetIds={(selectedKeys: string[]) => setMusicSheetIds(selectedKeys)}
          onSelectHandler={handleSelectSong}
          isStatic={false}
        >
          <SongPreviewItem songId={songHeader?.id} selectedMusicSheetIds={songHeader?.selected_music_sheet_ids} customTags={[]}/>
        </SelectSongDetailCardWrapper>
        <div className="absolute flex-center -translate-y-1/2 -right-4">
          <SwapOrderButton songHeader={songHeader} songOrder={songOrder}/>
        </div>

        <div className="w-full flex-1">
          <Textarea
            className="h-full bg-white"
            placeholder="Write a note for the song. (Update note in the Song Board to set as default)"
            value={songHeader?.note}
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
