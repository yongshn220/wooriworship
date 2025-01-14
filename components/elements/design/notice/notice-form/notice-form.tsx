import {Dialog, DialogContent, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import React, {useEffect, useState} from "react";
import {FormMode} from "@/components/constants/enums";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ImageFileContainer} from "@/components/constants/types";
import {Button} from "@/components/ui/button";
import {auth} from "@/firebase";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {noticeAtom, noticeIdsAtom, noticeUpdaterAtom} from "@/global-states/notice-state";
import {NoticeService, StorageService} from "@/apis";
import {toast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import {UploadedImageFileCard} from "@/components/elements/util/image/uploaded-image-file-card";
import {UploadIcon} from "lucide-react";


interface Props {
  mode: FormMode
  isOpen: boolean
  setIsOpen: Function
  noticeId?: string
}

export interface NoticeInput {
  title: string
  body: string
}

export function NoticeForm({mode, isOpen, setIsOpen, noticeId}: Props) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setNoticeIds = useSetRecoilState(noticeIdsAtom(teamId))
  const noticeUpdater = useSetRecoilState(noticeUpdaterAtom)
  const notice = useRecoilValue(noticeAtom(noticeId))
  const [input, setInput] = useState<NoticeInput>({
    title: (mode === FormMode.EDIT)? notice?.title?? "" : "",
    body: (mode === FormMode.EDIT)? notice?.body?? "" : "",
  })
  const [imageFileContainers, setImageFileContainers] = useState<Array<ImageFileContainer>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const _imageFileContainers = notice?.file_urls.map((url) => ({id: "", file: null, url: url, isLoading:false})) as Array<ImageFileContainer>
      if (_imageFileContainers)
        setImageFileContainers(_imageFileContainers)
    }
  }, [mode, notice?.file_urls])

  function clearContents() {
    setInput({title: "", body: ""})
    setImageFileContainers([])
  }

  function handleRemoveImage(index: number) {
    setImageFileContainers(item =>item.filter((_, i) => i !== index));
  }

  function updateImageFileContainer(newContainer: ImageFileContainer) {
    if (imageFileContainers.map((_container) => _container.id).includes(newContainer.id)) {
      const newContainers = imageFileContainers.map((_container) => (_container.id !== newContainer.id)? _container : newContainer)
      setImageFileContainers(newContainers)
    }
    else {
      setImageFileContainers([...imageFileContainers, newContainer])
    }
  }

  async function handleEdit() {
    try {
      const curImageUrls = imageFileContainers.map(item => item.url)
      const filesToAdd = imageFileContainers.filter(item => !!item.id) as Array<ImageFileContainer>
      const urlsToDelete = notice.file_urls.filter(url => !curImageUrls.includes(url))
      let urlsToKeep = notice.file_urls.filter(url => curImageUrls.includes(url))
      const newDownloadUrls = await StorageService.updateNoticeFiles(teamId, filesToAdd, urlsToDelete);
      if (newDownloadUrls.length > 0) {
        urlsToKeep = urlsToKeep.concat(newDownloadUrls)
      }
      const noticeInput = {
        title: input?.title,
        body: input?.body,
        file_urls: urlsToKeep
      }
      if (await NoticeService.updateNotice(noticeId, noticeInput)) {
        toast({
          title: `Notice updated successfully!`,
          description: input.title,
        })
        noticeUpdater(prev => prev + 1)
      }
      else {
        toast({
          description: "Fail to edit notice-board. Please try again."
        })
      }
    }
    catch (e) {
      console.log(e);
    }
    finally {
      setIsLoading(false)
      clearContents()
      setIsOpen(false)
    }
  }

  async function handleCreate() {
    setIsLoading(true)
    try {
      const downloadUrls = await StorageService.uploadNoticeFiles(teamId, imageFileContainers)
      const noticeInput = {
        title: input.title,
        body: input.body,
        file_urls: downloadUrls
      }
      console.log(noticeInput)
      const noticeId = await NoticeService.addNewNotice(authUser.uid, teamId, noticeInput);
      if (!noticeId) {
        toast({
          description: "Fail to create notice-board. Please try again."
        })
      }
      else {
        toast({
          title: `New Notice created!`,
          description: input.title,
        })
        setNoticeIds((prev) => ([...prev, noticeId]))
      }
    }
    catch (e) {
      console.log(e);
    }
    finally {
      setIsLoading(false)
      clearContents()
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide">
        <DialogTitle className="text-2xl">{mode===FormMode.EDIT? "Edit Notice" : "Add New Notice"}</DialogTitle>
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
              value={input.body}
              onChange={(e) => setInput((prev => ({...prev, body: e.target.value})))}
            />
          </div>
          <div className="flex w-full py-2 gap-2">
            <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
              <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                <UploadIcon className="h-6 w-6 text-gray-500" />
                <span className="mt-2 text-sm text-gray-500">
                  Upload Image
                </span>
              </div>
            </MultipleImageUploader>
            <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
              <div
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                <UploadIcon className="h-6 w-6 text-gray-500"/>
                <span className="mt-2 text-sm text-gray-500">
                  Upload PDF
                </span>
              </div>
            </PdfUploader>
          </div>
          <div className="flex-start w-full h-60 aspect-square border-2 p-2 rounded-md shadow-xs">
            <div className="flex w-full h-full gap-4 overflow-x-auto">
              {
                imageFileContainers?.map((imageFileContainer, i) => (
                  <UploadedImageFileCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImage(index)}/>
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
