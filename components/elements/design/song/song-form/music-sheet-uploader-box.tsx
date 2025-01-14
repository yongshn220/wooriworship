import {ImageFileContainer} from "@/components/constants/types";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {UploadedImageFileCard} from "@/components/elements/util/image/uploaded-image-file-card";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import React from "react";



interface Props {
  index: number
  tempId: string
  musicKey: string
  setMusicKey: Function
  imageFileContainers: Array<ImageFileContainer>
  handleAddImageFileContainer: Function
  handleRemoveImageFileContainer: Function
  handleRemoveMusicSheetContainer: Function
}

export function MusicSheetUploaderBox({index, tempId, imageFileContainers, musicKey, setMusicKey, handleAddImageFileContainer, handleRemoveImageFileContainer, handleRemoveMusicSheetContainer}: Props) {
  function updateImageFileContainer(newContainer: ImageFileContainer) {
    handleAddImageFileContainer(tempId, newContainer)
  }

  return (
    <Card className="w-full border rounded-lg p-2 space-y-4 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Sheet {index + 1}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveMusicSheetContainer(tempId)}
        >
          <X className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent className="w-full h-full space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            placeholder="ex) Em"
            value={musicKey ?? ""}
            onChange={(e) => setMusicKey(tempId, e.target.value)}
            className="bg-white"
          />
        </div>
        {
          imageFileContainers?.length > 0 &&
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4 bg-white">
              {
                imageFileContainers?.map((imageFileContainer, i) => (
                  <figure key={i} className="shrink-0">
                    <div className="overflow-hidden w-full h-full">
                      <UploadedImageFileCard imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImageFileContainer(tempId, index)}/>
                    </div>
                  </figure>
                ))
              }
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        }
        <div className="w-full flex-center">
          <div className="flex gap-4">
            <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
              <div className="w-32 bg-white px-1 py-2 flex-center  rounded-md shadow-sm border text-sm hover:bg-blue-50 cursor-pointer">Upload Image</div>
            </MultipleImageUploader>
            <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
              <div className="w-32 bg-white px-1 py-2 flex-center  rounded-md shadow-sm border text-sm hover:bg-blue-50 cursor-pointer">Upload PDF</div>
            </PdfUploader>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
