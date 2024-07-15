// import * as React from "react";
// import {useMemo} from "react";
// import {Card, CardContent} from "@/components/ui/card";
// import {WorshipNote} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-note";
// import {CarouselItem} from "@/components/ui/carousel";
// import {SongHeader} from "@/models/worship";
// import {songAtom} from "@/global-states/song-state";
// import {useRecoilValue} from "recoil";
// import {worshipMultipleSheetsViewModeAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
// import {DirectionType} from "@/components/constants/enums";
//
// interface Props {
//   index: number
//   songHeader: SongHeader
// }
//
// interface SheetInfo {
//   note: string
//   urls: string[]
// }
//
// export function SongCarouselFullItem({index, songHeader}: Props) {
//   const song = useRecoilValue(songAtom(songHeader?.id))
//   const multipleSheetsViewMode = useRecoilValue(worshipMultipleSheetsViewModeAtom)
//
//   const sheetInfo = useMemo(() => {
//     const processedSheetInfo: Array<SheetInfo> = []
//     if (multipleSheetsViewMode === DirectionType.VERTICAL) {
//       processedSheetInfo.push({note: songHeader.note, urls: song?.music_sheet_urls})
//     }
//     else {
//       song?.music_sheet_urls?.forEach((url) => {
//         processedSheetInfo.push({note: songHeader.note, urls: [url]})
//       })
//     }
//     return processedSheetInfo
//   }, [multipleSheetsViewMode, song?.music_sheet_urls, songHeader.note])
//
//
//   return (
//     <>
//       {
//         sheetInfo?.map((info) => (
//           <CarouselItem key={`${index}-${Math.floor(Math.random() * 1000)}`} className="h-full">
//             <Card className="h-full">
//               <CardContent className="flex flex-col w-full h-full divide-y">
//                 <WorshipNote description={info.note}/>
//                 <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-y-scroll lg:mx-10">
//                   {
//                     info?.urls.map((url, index) => (
//                       <div key={index} className="flex-center w-full h-full">
//                         <img
//                           alt="Music score"
//                           src={url}
//                           className="h-full object-contain rounded-md"
//                         />
//                       </div>
//                     ))
//                   }
//                 </div>
//               </CardContent>
//             </Card>
//           </CarouselItem>
//         ))
//       }
//     </>
//   )
// }
//
//
//                 {/*<div className="relative flex-1 h-full bg-gray-50 overflow-y-scroll lg:mx-10 grid grid-cols-1">*/}
//                 {/*    {*/}
//                 {/*      song.music_sheet_urls.map((url, index) => (*/}
//                 {/*        <div key={index} className="relative flex-center w-full h-full bg-red-500 border">*/}
//                 {/*          <Image*/}
//                 {/*            alt="Music score"*/}
//                 {/*            src={url}*/}
//                 {/*            fill*/}
//                 {/*            className="h-full object-contain"*/}
//                 {/*          />*/}
//                 {/*        </div>*/}
//                 {/*      ))*/}
//                 {/*    }*/}
//                 {/*</div>*/}
