import { v4 as uuid } from 'uuid';
import {Dispatch, SetStateAction} from "react";
import {MusicSheet} from "@/app/board/[teamId]/song/_components/song-form";

interface Props {
  musicSheets: Array<MusicSheet>;
  setMusicSheets: Dispatch<SetStateAction<Array<MusicSheet>>>;
  maxNum: number;
  children: any;
}

export default function MultipleImageUploader({musicSheets, setMusicSheets, maxNum, children}: Props) {
  async function handleImageChange(e: any) {
    const files = Array.from(e.target.files) as Array<File>
    const totalImages = musicSheets?.length + files.length

    try {
      if (totalImages <= maxNum) {
        files.forEach((file) => {
          const reader: any = new FileReader();
          reader.readAsDataURL(file);
          const imageId = uuid()
          setMusicSheets((prev: Array<MusicSheet>) =>([...prev, {id: imageId, file: file, url: "", isLoading: true}]))

          reader.onloadend = () => {
            setMusicSheets((prevImages) => {
              return prevImages.map(prev => {
                return (prev.id !== imageId)? prev : {...prev, url: reader.result.toString(), isLoading: false}
              })
            })
          };
        })
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
    }
  }

  return (
    <div className="w-full h-full">
      <input
        type="file"
        id="image-input"
        name="Image"
        style={{display: 'none'}}
        accept="image/*"
        onChange={handleImageChange}
        multiple
      />
      <label htmlFor="image-input">
        {children}
      </label>
    </div>
  )
}
