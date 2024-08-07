import Image from "next/image"
import {LoadingCircle} from "@/components/animation/loading-indicator";
import {Cross2Icon} from "@radix-ui/react-icons";
import {ImageFileContainer} from "@/components/constants/types";

interface Props {
  imageFileContainer: ImageFileContainer
  index: number
  handleRemoveImage: Function
}

export function MusicSheetCard({imageFileContainer, index, handleRemoveImage}: Props) {
  return (
    <div className="relative flex flex-col h-full aspect-[3/4]">
      <div className="relative flex-1 flex-start bg-gray-100 rounded-md">
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
            <Cross2Icon className="absolute right-1 top-1 p-0.5 cursor-pointer bg-gray-600 hover:bg-black rounded-full text-white" width={17} height={17} onClick={() => handleRemoveImage(index)}/>
          </>
        }
      </div>
      <p className="text-center text-xs text-gray-400 mt-1 font-semibold">{index + 1}</p>
    </div>
  )
}
