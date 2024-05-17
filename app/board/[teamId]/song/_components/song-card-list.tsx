"use client"

import {useRecoilValueLoadable} from "recoil";
import {SongCard} from "@/app/board/[teamId]/song/_components/song-card";
import {currentTeamSongIdsAtom} from "@/app/board/[teamId]/song/_states/song-board-states";

export function SongCardList() {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom)

  switch (songIdsLoadable.state) {
    case 'loading': return <></>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
          {
            songIdsLoadable.contents.map((songId) => (
              <SongCard key={songId} songId={songId}/>
            ))
          }
        </div>
      )
  }
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
