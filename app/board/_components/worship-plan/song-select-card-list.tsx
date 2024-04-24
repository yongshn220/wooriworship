import {Song} from "@/models/song";
import {SongSelectCard} from "@/app/board/_components/worship-plan/song-select-card";
import {useRecoilValue} from "recoil";
import {selectedSongListAtom} from "@/app/board/_components/worship-plan/status";
import {useMemo} from "react";
import {useDebounce} from "use-debounce";

interface Props {
  searchInput: string
  songList: Array<Song>
}

export function SongSelectCardList({searchInput, songList}: Props) {
  const selectedSongList = useRecoilValue(selectedSongListAtom)
  const [debounced] = useDebounce(searchInput, 500)

  const preprocessedSongList = useMemo(() => {
    const keyword = debounced.replace(/[a-zA-Z\uAC00-\uD7AF]/g, (match) => match.toLowerCase())
    console.log(keyword)
    return songList.filter((song) => song.title.includes(keyword))
  }, [songList, debounced])

  const selectedSongIds = useMemo(() => selectedSongList.map((song) => song.id), [selectedSongList])

  return (
    <div
      className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 mt-10">
      {
        preprocessedSongList.map((song: Song) => (
          <SongSelectCard
            key={song.id}
            song={JSON.parse(JSON.stringify(song))}
            isSelected={selectedSongIds.includes(song.id)}
          />
        ))
      }
    </div>
  )
}
