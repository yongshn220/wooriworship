"use client"
import {useRecoilState, useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom, songAtom} from "@/global-states/song-state";
import {SongListItem, ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {Checkbox} from "@/components/ui/checkbox";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {useMemo} from "react";

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
                <p className="flex justify-end lg:flex-[0.5] pl-2">Last used date</p>
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
              {/*<p className="text-gray-500">Click &ldquo;Add Song&rdquo; button to create one!</p>*/}
              {/*<NewSongButton/>*/}
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
  const [selectedSongInfoList, setSelectedSongInfoList] = useRecoilState(selectedSongInfoListAtom)
  const song = useRecoilValue(songAtom(songId))

  const isSongSelected = useMemo(() => selectedSongInfoList.map(info => info?.song?.id).includes(songId), [selectedSongInfoList, songId])

  function handleSongSelectChange(state: any) {
    console.log(state)
    if (state === true) {
      setSelectedSongInfoList(prev => ([...prev, {song, note: song?.description}]))
    }
    else if (state === false) {
      setSelectedSongInfoList(prev => (prev.filter(songInfo => songInfo?.song?.id != song.id)))
    }
  }

  return (
    <div className="w-full flex-center">
      <Checkbox id="select" className="mr-4" checked={isSongSelected} onCheckedChange={(state) => handleSongSelectChange(state)}/>
      <SongDetailCardWrapper teamId={teamId} songId={songId}>
        <SongListItem songId={songId} viewMode={ViewMode.NONE}/>
      </SongDetailCardWrapper>
    </div>
  )
}
