import {useRecoilState, useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {useState} from "react";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import {AddableSongDetailDialogTrigger} from "@/components/elements/design/song/song-detail-card/worship-form/addable-song-detail-dialog-trigger";
import {SongHeaderDefault} from "@/components/elements/design/song/song-header/default/song-header-default";
import * as React from "react";

interface Props {
  teamId: string
  songId: string
}

export function AddableSongHeaderDefault({teamId, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const [selectedMusicSheetIds, setSelectedMusicSheetIds] = useState<Array<string>>([])
  const [selectedWorshipSongHeaderList, setSelectedWorshipSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)

  function handleSelectSong() {
    if (isSongSelected()) {
      setSelectedWorshipSongHeaderList((prev) => ([...prev.filter((_header => _header?.id !== songId))]))
    }
    else {
      setSelectedWorshipSongHeaderList((prev) => ([...prev, {
        id: song?.id,
        note: song?.description,
        selected_music_sheet_ids: selectedMusicSheetIds
      }]))
    }
  }

  function isSongSelected() {
    return selectedWorshipSongHeaderList?.map(songHeader => songHeader?.id)?.includes(songId)
  }

  return (
    <div className="w-full flex-center">
      <AddableSongDetailDialogTrigger
        teamId={teamId}
        songId={songId}
        selectedMusicSheetIds={selectedMusicSheetIds}
        setMusicSheetIds={(musicSheetIds) => setSelectedMusicSheetIds(musicSheetIds)}
        isStatic={false}
        onSelectHandler={() => handleSelectSong()}
      >
        <SongHeaderDefault songId={songId}/>
      </AddableSongDetailDialogTrigger>
    </div>
  )
}
