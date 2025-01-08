// 'use client'
//
// import {useState} from "react";
// import {SongForm} from "@/app/board/[teamId]/song-board/_components/song-board-form";
// import {FormMode} from "@/components/constants/enums";
//
// export function CreateSongDialog({children}: any) {
//   const [isOpen, setIsOpen] = useState(false)
//
//   return (
//     <div>
//       <SongForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen}/>
//       <div className="flex-center flex-col space-y-1 cursor-pointer" onClick={() => setIsOpen(prev => !prev)}>
//         {children}
//       </div>
//     </div>
//   )
// }
