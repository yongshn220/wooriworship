import { v4 as uuid } from 'uuid';
import {Dispatch, SetStateAction} from "react";
import {ImageFileContainer} from "@/components/constants/types";

interface Props {
  imageFileContainers: Array<ImageFileContainer>;
  setImageFileContainers: Dispatch<SetStateAction<Array<ImageFileContainer>>>;
  maxNum: number;
  children: any;
}

export default function MultipleImageUploader({imageFileContainers, setImageFileContainers, maxNum, children}: Props) {
  async function handleImageChange(e: any) {
    const files = Array.from(e.target.files) as Array<File>
    const totalImages = imageFileContainers?.length + files.length

    try {
      if (totalImages <= maxNum) {
        files.forEach((file) => {
          const reader: any = new FileReader();
          reader.readAsDataURL(file);
          const imageId = uuid()
          setImageFileContainers((prev: Array<ImageFileContainer>) =>([...prev, {id: imageId, file: file, url: "", isLoading: true}]))

          reader.onloadend = () => {
            setImageFileContainers((prevImages) => {
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
    <div>
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
