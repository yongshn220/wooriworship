import { v4 as uuid } from 'uuid';
import {ImageFileContainer} from "@/components/constants/types";
import {useRef, useState} from "react";

interface Props {
  imageFileContainers: Array<ImageFileContainer>;
  updateImageFileContainer: Function;
  maxNum: number;
  children: any;
}

export default function MultipleImageUploader({imageFileContainers, updateImageFileContainer, maxNum, children}: Props) {
  const [uploaderId, _] = useState(uuid())
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: any) {
    const files = Array.from(e.target.files) as Array<File>
    const totalImages = imageFileContainers?.length + files.length
    try {
      if (totalImages <= maxNum) {

        files.forEach((file) => {
          const reader: any = new FileReader();
          reader.readAsDataURL(file);
          const uniqueId = uuid()
          let newImageFileContainer: ImageFileContainer = {id: uniqueId, file: file, url: "", isLoading: true, isUploadedInDatabase: false}
          updateImageFileContainer(newImageFileContainer)

          reader.onloadend = () => {
            updateImageFileContainer({...newImageFileContainer, url: reader.result.toString(), isLoading: false})
          }
        })
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
      // Reset the file input to trigger onChange even with the same file.
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id={uploaderId}
        name="Image"
        style={{display: 'none'}}
        accept="image/*"
        onChange={handleImageChange}
        multiple
      />
      <label htmlFor={uploaderId}>
        {children}
      </label>
    </div>
  )
}
