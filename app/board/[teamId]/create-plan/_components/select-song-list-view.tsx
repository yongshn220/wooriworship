"use client"
import {useRecoilState, useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom, songAtom} from "@/global-states/song-state";
import {SongListItem} from "@/app/board/[teamId]/song/_components/song-list-item";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {useState} from "react";
import {SelectSongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/select-song-detail-card-wrapper";

interface Props {
  teamId: string
}

export function SelectSongListView({teamId}: Props) {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))

  switch (songIdsLoadable.state) {
    case 'loading': return <></>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          {
            (songIdsLoadable.contents?.length > 0) &&
            <div className="w-full pl-5">
              <div className="hidden md:flex text-sm text-gray-600 px-6 mt-10 font-semibold">
                <p className="flex-1">Title</p>
                <p className="hidden lg:flex flex-[0.4] justify-start border-l border-gray-300 pl-2">Version</p>
                <div className="hidden sm:flex justify-start sm:flex-1 text-start border-l border-gray-300 pl-2">Tag</div>
                <p className="flex justify-end lg:flex-[0.5] pl-2">Used on</p>
              </div>
            </div>
          }
          {
            (songIdsLoadable.contents?.length > 0) ?
            <div className="w-full box-border">
              {
                songIdsLoadable.contents.map((songId) => (
                  <div key={songId} className="w-full">
                    <SelectSongListItem teamId={teamId} songId={songId}/>
                    <Separator/>
                  </div>
                ))
              }
            </div>
              :
            <div className="w-full h-full flex-center flex-col gap-4 py-10">
              <Image
                alt="compose music image"
                src="/illustration/happyMusic.svg"
                width={200}
                height={200}
              />
              <p className="text-xl font-semibold">No matching songs!</p>
            </div>
          }
        </div>
      )
  }
}

interface ItemProps {
  teamId: string
  songId: string
}

function SelectSongListItem({teamId, songId}: ItemProps) {
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
      <SelectSongDetailCardWrapper
        teamId={teamId}
        songId={songId}
        selectedMusicSheetIds={selectedMusicSheetIds}
        setMusicSheetIds={(musicSheetIds) => setSelectedMusicSheetIds(musicSheetIds)}
        isStatic={false}
        onSelectHandler={() => handleSelectSong()}
      >
        <SongListItem songId={songId}/>
      </SelectSongDetailCardWrapper>
    </div>
  )
}
