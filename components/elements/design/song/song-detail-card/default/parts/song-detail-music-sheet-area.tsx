import React, { useState } from "react";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { musicSheetAtom } from "@/global-states/music-sheet-state";


interface Props {
  musicSheetId: string
}
export function SongDetailMusicSheetArea({ musicSheetId }: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))

  if (!musicSheet?.urls || musicSheet.urls.length === 0) {
    return (
      <div className="w-full h-64 flex-center text-gray-400">
        No sheet available
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-2">
      {
        musicSheet.urls.map((url: string, i: number) => (
          <div key={i} className="relative w-full flex justify-center items-center">
            {/* 
              Render image to fit within the viewport height minus header. 
              object-contain ensures the whole sheet is visible.
            */}
            <img
              src={url}
              alt={`Sheet ${i + 1}`}
              className="w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm"
              loading="lazy"
            />
          </div>
        ))
      }
    </div>
  )
}
