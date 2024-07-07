import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import React, {useState} from "react";
import {FormMode} from "@/components/constants/enums";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import PdfUploader from "@/app/board/[teamId]/song/_components/pdf-uploader";
import {ImageFileContainer} from "@/components/constants/types";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import {Button} from "@/components/ui/button";
import {auth} from "@/firebase";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {noticeAtom} from "@/global-states/notice-state";


interface Props {
  mode: FormMode
  isOpen: boolean
  setIsOpen: Function
  noticeId?: string
}

export interface NoticeInput {
  title: string
  description: string
}

export function NoticeForm({mode, isOpen, setIsOpen, noticeId}: Props) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const notice = useRecoilValue(noticeAtom(noticeId))
  const [input, setInput] = useState<NoticeInput>({
    title: "",
    description: "",
  })
  const [imageFileContainers, setImageFileContainers] = useState<Array<ImageFileContainer>>([])
  const [isLoading, setIsLoading] = useState(false)

  function handleRemoveImage(index: number) {
    setImageFileContainers(item =>item.filter((_, i) => i !== index));
  }

  async function handleEdit() {
    // TODO: firebase
    // const curImageUrls = imageFileContainers.map(item => item.url)
    // const filesToAdd = imageFileContainers.filter(item => !!item.id) as Array<ImageFileContainer>
    // const urlsToDelete = notice.image_urls.filter(url => !curImageUrls.includes(url))
    // let urlsToKeep = notice.image_urls.filter(url => curImageUrls.includes(url))
  }

  async function handleCreate() {
    // TODO: firebase
    setIsLoading(true)
    try {
      console.log(input, imageFileContainers, authUser, teamId)
    }
    catch (e) {

    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide">
        <DialogTitle className="text-2xl">{mode===FormMode.EDIT? "Edit Notice" : "Add New Notice (Available Soon)"}</DialogTitle>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Title</Label>
            <Input
              id="title"
              placeholder="Write the title"
              value={input.title}
              onChange={(e) => setInput((prev => ({...prev, title: e.target.value})))}
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              className="h-20 text-base"
              placeholder="Write the description"
              value={input.description}
              onChange={(e) => setInput((prev => ({...prev, description: e.target.value})))}
            />
          </div>
          <div className="w-full h-14 py-2 flex-center gap-2">
            <MultipleImageUploader imageFileContainers={imageFileContainers} setImageFileContainers={setImageFileContainers} maxNum={5}>
              <div
                className="w-full h-full bg-blue-500 rounded-lg flex-center text-white cursor-pointer hover:bg-blue-400">
                Upload Image
              </div>
            </MultipleImageUploader>
            <PdfUploader imageFileContainers={imageFileContainers} setImageFileContainers={setImageFileContainers} maxNum={5}>
              <div
                className="w-full h-full bg-purple-700 rounded-lg flex-center text-white cursor-pointer hover:bg-purple-500">
                Upload PDF
              </div>
            </PdfUploader>
          </div>
          <div className="flex-start w-full h-60 aspect-square border-2 p-2 rounded-md shadow-xs">
            <div className="flex w-full h-full gap-4 overflow-x-auto">
              {
                imageFileContainers?.map((imageFileContainer, i) => (
                  <MusicSheetCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={handleRemoveImage}/>
                ))
              }
            </div>
          </div>
        </div>
        <DialogFooter>
          {
            (mode === FormMode.EDIT)
              ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
              : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
