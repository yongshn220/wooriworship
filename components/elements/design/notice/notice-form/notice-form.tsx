import React, { useEffect, useState } from "react";
import { FormMode } from "@/components/constants/enums";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageFileContainer } from "@/components/constants/types";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { noticeAtom, noticeIdsAtom, noticeUpdaterAtom } from "@/global-states/notice-state";
import { NoticeService, StorageService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import { UploadedImageFileCard } from "@/components/elements/util/image/uploaded-image-file-card";
import { UploadIcon, ImageIcon, FileText } from "lucide-react";
import { BaseForm } from "@/components/elements/util/form/base-form";
import { getPathNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";


interface Props {
  mode: FormMode
  noticeId?: string
}

export interface NoticeInput {
  title: string
  body: string
}

export function NoticeForm({ mode, noticeId }: Props) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setNoticeIds = useSetRecoilState(noticeIdsAtom(teamId))
  const noticeUpdater = useSetRecoilState(noticeUpdaterAtom)
  const notice = useRecoilValue(noticeAtom(noticeId))
  const [input, setInput] = useState<NoticeInput>({
    title: (mode === FormMode.EDIT) ? notice?.title ?? "" : "",
    body: (mode === FormMode.EDIT) ? notice?.body ?? "" : "",
  })
  const [imageFileContainers, setImageFileContainers] = useState<Array<ImageFileContainer>>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const _imageFileContainers = notice?.file_urls.map((url) => ({ id: "", file: null as File | null, url: url, isLoading: false })) as Array<ImageFileContainer>
      if (_imageFileContainers)
        setImageFileContainers(_imageFileContainers)
    }
  }, [mode, notice?.file_urls])

  function clearContents() {
    setInput({ title: "", body: "" })
    setImageFileContainers([])
  }

  function handleRemoveImage(index: number) {
    setImageFileContainers(item => item.filter((_, i) => i !== index));
  }

  function updateImageFileContainer(newContainer: ImageFileContainer) {
    if (imageFileContainers.map((_container) => _container.id).includes(newContainer.id)) {
      const newContainers = imageFileContainers.map((_container) => (_container.id !== newContainer.id) ? _container : newContainer)
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
      if (await NoticeService.updateNotice(noticeId, noticeInput) === false) {
        toast({ description: "Fail to edit notice-board. Please try again." }); return
      }

      toast({
        title: `Notice updated successfully!`,
        description: input.title,
      })

      noticeUpdater(prev => prev + 1)
      clearContents()
      router.push(getPathNotice(teamId))
    }
    catch (e) {
      console.log(e);
    }
    finally {
      setIsLoading(false)
      clearContents()
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

      toast({
        title: `New Notice created!`,
        description: input.title,
      })
      setNoticeIds((prev) => ([...prev, noticeId]))

      clearContents()
      router.push(getPathNotice(teamId))
    }
    catch (e) {
      console.log(e);
    }
    finally {
      setIsLoading(false)
      clearContents()
    }
  }

  return (
    <BaseForm title={mode === FormMode.EDIT ? "Edit Notice" : "Add New Notice"} description="Enter the details of your notice below">
      <div className="flex flex-col gap-6 py-4">
        <div className="flex-start flex-col items-center gap-1.5">
          <Label htmlFor="name">Title</Label>
          <Input
            id="title"
            placeholder="Write the title"
            value={input.title}
            onChange={(e) => setInput((prev => ({ ...prev, title: e.target.value })))}
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
            onChange={(e) => setInput((prev => ({ ...prev, body: e.target.value })))}
          />
        </div>
        <div className="flex w-full items-center gap-3 pt-2">
          <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
            <Button variant="outline" size="sm" type="button" className="gap-2 text-gray-600 hover:text-gray-900 border-dashed border-gray-300 hover:border-gray-400">
              <ImageIcon className="h-4 w-4" />
              <span>Add Image</span>
            </Button>
          </MultipleImageUploader>
          <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
            <Button variant="outline" size="sm" type="button" className="gap-2 text-gray-600 hover:text-gray-900 border-dashed border-gray-300 hover:border-gray-400">
              <FileText className="h-4 w-4" />
              <span>Add PDF</span>
            </Button>
          </PdfUploader>
        </div>
        <div className="flex-start w-full h-40 border-2 p-2 rounded-md shadow-xs bg-white">
          <div className="flex w-full h-full gap-4 overflow-x-auto items-center">
            {
              imageFileContainers?.map((imageFileContainer, i) => (
                <UploadedImageFileCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImage(index)} />
              ))
            }
          </div>
        </div>
      </div>
      <div className="w-full flex-end my-10">
        <div>
          {
            (mode === FormMode.EDIT)
              ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
              : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          }
        </div>
      </div>
    </BaseForm>
  )
}
