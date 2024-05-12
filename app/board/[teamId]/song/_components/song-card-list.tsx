"use client"

import SongService from "@/apis/SongService";
import {useEffect, useState} from "react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {SongCard} from "@/app/board/[teamId]/song/_components/song-card";

export function SongCardList() {
  const [songIds, setSongIds] = useState([])
  const teamId = useRecoilValue(currentTeamIdAtom)

  useEffect(() => {
    SongService.getTeamSong(teamId).then((songList => {
      setSongIds(songList.map((song) => song.id))
    }))

  }, [teamId]);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
      {
        songIds.map((songId) => (
          <SongCard key={songId} songId={songId}/>
        ))
      }
    </div>
  )
}


/*
  const songSearchInput = useRecoilValue(songSearchInputAtom)
  const selectedTags = useRecoilValue(searchSelectedTagsAtom)
  const [debounced] = useDebounce(songSearchInput, 500)

  const preprocessedSongList = useMemo(() => {
    const keyword = debounced.replace(/[a-zA-Z\uAC00-\uD7AF]/g, (match) => match.toLowerCase())
    let filtered = songList.filter((song) => song.title.includes(keyword))
    return filtered.filter((song) => song.tags.some(tag => selectedTags.includes(tag) || selectedTags.length === 0))
  }, [songList, selectedTags, debounced])

 */
