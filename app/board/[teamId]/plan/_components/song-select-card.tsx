// 'use client'
// import {HoverOverlay} from "@/components/hover-overlay";
// import MoodNeutralIcon from '@/public/icons/moodNeutralIcon.svg'
// import MoodCheckIcon from '@/public/icons/moodCheckIcon.svg'
// import {Badge} from "@/components/ui/badge";
// import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
// import {useState} from "react";
// import {Song} from "@/models/song";
// import {useSetRecoilState} from "recoil";
// import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
// import {toPlainObject} from "@/components/helper/helper-functions";
//
// interface Props {
//   teamId: string
//   song: Song
//   isSelected: boolean
// }
// export function SongSelectCard({teamId, song, isSelected}: Props) {
//   const setSelectedSongInfoList = useSetRecoilState(selectedSongInfoListAtom)
//   const [isOpen, setIsOpen] = useState(false)
//
//   return (
//     <div className="h-full">
//       <SongDetailCard teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} song={toPlainObject(song)} readOnly={true}/>
//       <div className="aspect-[5/4] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC]">
//         <div className="relative group h-full flex-center flex-col text-white cursor-pointer" onClick={() => setIsOpen(true)}>
//           <HoverOverlay/>
//           <p className="font-semibold text-sm">{song?.title}</p>
//           <p className="text-sm">{song?.original.author}</p>
//         </div>
//         <div className="w-full flex-center bg-white p-2">
//           {
//             isSelected ?
//             <div
//               className="w-full h-full flex justify-start items-center rounded-lg cursor-pointer"
//               onClick={() => setSelectedSongInfoList(prev => (prev.filter(songInfo => songInfo?.song?.id != song.id)))}
//             >
//               <div className="cursor-pointer p-2 text-blue-500">
//                 <MoodCheckIcon/>
//               </div>
//               <p className="text-xs text-gray-500">Song added!</p>
//             </div>
//             :
//             <div
//               className="w-full h-full flex justify-start items-center cursor-pointer hover:bg-gray-100 rounded-lg"
//               onClick={() => setSelectedSongInfoList(prev => ([...prev, {song, note: song?.description}]))}
//             >
//               <div className="cursor-pointer p-2">
//                 <MoodNeutralIcon/>
//               </div>
//               <p className="text-xs text-gray-500">Click me to add!</p>
//             </div>
//           }
//         </div>
//       </div>
//       <div className="w-full text-left text-sm mt-1 space-x-2 space-y-2">
//         {
//           song?.tags.map((tag,i) => (
//             <Badge key={i} variant="outline">{tag}</Badge>
//           ))
//         }
//       </div>
//     </div>
//   )
// }
