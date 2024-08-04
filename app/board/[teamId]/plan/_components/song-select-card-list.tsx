// import {Song} from "@/models/song";
// import {SongSelectCard} from "@/app/board/[teamId]/plan/_components/song-select-card";
// import {useRecoilValue} from "recoil";
// import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/plan/_components/status";
// import {useMemo} from "react";
// import {useDebounce} from "use-debounce";
//
// interface Props {
//   teamId: string
//   searchInput: string
//   songList: Array<Song>
// }
//
// export function SongSelectCardList({teamId, searchInput, songList}: Props) {
//   const selectedSongInfoList = useRecoilValue(selectedWorshipSongHeaderListAtom)
//   const [debounced] = useDebounce(searchInput, 500)
//
//   const preprocessedSongList = useMemo(() => {
//     const keyword = debounced.replace(/[a-zA-Z\uAC00-\uD7AF]/g, (match) => match.toLowerCase())
//     console.log(keyword)
//     return songList.filter((song) => song.title.includes(keyword))
//   }, [songList, debounced])
//
//   const selectedSongIds = useMemo(() => selectedSongInfoList.map((info) => info?.song?.id), [selectedSongInfoList])
//
//   return (
//     <div
//       className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 mt-10">
//       {
//         preprocessedSongList.map((song: Song) => (
//           <SongSelectCard
//             teamId={teamId}
//             key={song.id}
//             songId={song.id}
//             isSelected={selectedSongIds.includes(song.id)}
//           />
//         ))
//       }
//     </div>
//   )
// }
