import Image from "next/image"
import {LoadingCircle} from "@/components/util/animation/loading-indicator";
import {Cross2Icon} from "@radix-ui/react-icons";
import {ImageFileContainer} from "@/components/constants/types";

interface Props {
  imageFileContainer: ImageFileContainer
  index: number
  handleRemoveImage: (index: number) => void
}

export function UploadedImageFileCard({imageFileContainer, index, handleRemoveImage}: Props) {
  return (
    <div className="flex flex-col w-full border rounded-lg overflow-hidden bg-muted/20">
      <div className="relative aspect-square w-full">
        {
          imageFileContainer.isLoading ?
          <LoadingCircle/>
          :
          <>
            <Image
              src={imageFileContainer.url}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover rounded-t-lg"
              alt="Music sheet image"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute right-1 top-1 p-1 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
            >
              <Cross2Icon className="text-white" width={16} height={16} />
            </button>
          </>
        }
      </div>
      <p className="text-center text-xs text-muted-foreground py-1.5 font-medium">{index + 1}</p>
    </div>
  )
}
