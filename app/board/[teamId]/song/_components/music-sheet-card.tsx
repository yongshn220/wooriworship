import Image from "next/image"
import {LoadingCircle} from "@/components/animation/loading-indicator";
import {Cross2Icon} from "@radix-ui/react-icons";
import {ImageFileContainer} from "@/components/constants/types";

interface Props {
  imageFileContainer: ImageFileContainer
  index: number
  handleRemoveImage: (index: number) => {}
}

export function MusicSheetCard({imageFileContainer, index, handleRemoveImage}: Props) {
  return (
    <div className="relative flex flex-col h-full aspect-[3/4] border rounded-lg bg-white">
      <div className="relative flex-1 flex-start rounded-md">
        {
          imageFileContainer.isLoading ?
          <LoadingCircle/>
          :
          <>
            <Image
              src={imageFileContainer.url}
              fill
              sizes="20vw, 20vw, 20vw"
              className="object-contain p-1 rounded-md"
              alt="Music sheet image"
            />
            <Cross2Icon className="absolute right-1 top-1 cursor-pointer rounded-full hover:text-blue-500" width={20} height={20} onClick={() => handleRemoveImage(index)}/>
          </>
        }
      </div>
      <p className="text-center text-xs text-gray-400 mt-1 font-semibold">{index + 1}</p>
    </div>
  )
}
