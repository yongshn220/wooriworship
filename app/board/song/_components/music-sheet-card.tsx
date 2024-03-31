import {MusicSheet} from "@/app/board/song/_components/new-button";
import Image from "next/image"
import {LoadingCircle} from "@/components/animation/loading-indicator";

interface Props {
  musicSheet: MusicSheet
  index: number
}

export function MusicSheetCard({musicSheet, index}: Props) {
  return (
    <div className="relative flex flex-col h-full aspect-[3/4]">
      <div className="relative flex-1 flex-center bg-gray-100 rounded-md">
        {
          musicSheet.isLoading ?
          <LoadingCircle/>
          :
          <Image
            src={musicSheet.url}
            fill={true}
            sizes="20vw"
            alt="store post image"
            className="object-fit rounded-md p-1"
          />
        }
      </div>
      <p className="text-center text-xs text-gray-400 mt-1 font-semibold">{index + 1}</p>
    </div>
  )
}
