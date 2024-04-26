"use client"

import {Song} from "@/models/song";
import {SongCard} from "@/app/board/[teamId]/song/_components/song-card";
import { useDebounce } from 'use-debounce';
import {useEffect, useMemo, useState} from "react";
import {searchSelectedTagsAtom, songSearchInputAtom} from "@/app/board/_states/pageState";
import {useRecoilValue} from "recoil";


interface Props {
  songList: Array<Song>
}

export function SongCardList({songList}: Props) {
  const songSearchInput = useRecoilValue(songSearchInputAtom)
  const selectedTags = useRecoilValue(searchSelectedTagsAtom)
  const [debounced] = useDebounce(songSearchInput, 500)

  const preprocessedSongList = useMemo(() => {
    const keyword = debounced.replace(/[a-zA-Z\uAC00-\uD7AF]/g, (match) => match.toLowerCase())
    let filtered = songList.filter((song) => song.title.includes(keyword))
    return filtered.filter((song) => song.tags.some(tag => selectedTags.includes(tag) || selectedTags.length === 0))
  }, [songList, selectedTags, debounced])

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
      {
        preprocessedSongList.map((song: Song) => (
          <SongCard key={song.id} song={JSON.parse(JSON.stringify(song))}/>
        ))
      }
    </div>
  )
}
