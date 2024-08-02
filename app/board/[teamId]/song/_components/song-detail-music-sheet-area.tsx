import React, {useState} from "react";
import {SongMusicSheetViewer} from "@/app/board/[teamId]/song/_components/song-music-sheet-viewer";
import Image from "next/image";
import {useRecoilValue} from "recoil";
import {musicSheetAtom} from "@/global-states/music-sheet-state";


interface Props {
  musicSheetId: string
}
export function SongDetailMusicSheetArea({musicSheetId}: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))
  const [isMusicSheetViewOpen, setMusicSheetViewOpen] = useState(false)

  function handleMusicSheetClick() {
    setMusicSheetViewOpen(true)
  }

  return (
    <>
      <SongMusicSheetViewer isOpen={isMusicSheetViewOpen} setIsOpen={setMusicSheetViewOpen} musicSheetUrls={musicSheet?.urls}/>
      {
        musicSheet?.urls?.length > 0 &&
        <div className="flex-center w-full h-60 aspect-square">
          <div className="flex-center w-full h-full gap-4 overflow-x-auto pb-2">
            {
              musicSheet?.urls?.map((url: string, i: number) => (
                <div key={i} className="relative flex flex-col h-full aspect-[3/4] border rounded bg-white" onClick={handleMusicSheetClick}>
                  <div className="relative flex-1 flex-start rounded-md">
                    <Image
                      src={url}
                      fill
                      sizes="10vw, 10vw, 10vw"
                      className="object-contain rounded-md"
                      alt="EventImage"
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      }
    </>
  )
}
