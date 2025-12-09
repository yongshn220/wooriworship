import React, { useEffect, useState } from "react";
import { FormMode } from "@/components/constants/enums";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageFileContainer } from "@/components/constants/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/firebase";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { noticeAtom, noticeIdsAtom, noticeUpdaterAtom, noticeIdsUpdaterAtom } from "@/global-states/notice-state";

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
  const setNoticeIdsUpdater = useSetRecoilState(noticeIdsUpdaterAtom)
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
      setNoticeIdsUpdater((prev) => prev + 1)

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
    <BaseForm title="" description="">
      <div className="flex flex-col w-full max-w-4xl mx-auto min-h-[600px]">

        {/* Header Action Row */}
        <div className="flex flex-row justify-between items-start mb-8 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === FormMode.EDIT ? "Edit Notice" : "New Notice"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Share updates and news with your team.</p>
          </div>
          <div>
            {
              (mode === FormMode.EDIT)
                ? <Button type="submit" onClick={handleEdit} className="min-w-[100px] bg-gray-900 hover:bg-black text-white">{isLoading ? "Saving..." : "Save Changes"}</Button>
                : <Button type="submit" onClick={handleCreate} className="min-w-[100px] bg-gray-900 hover:bg-black text-white">{isLoading ? "Creating..." : "Publish"}</Button>
            }
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6 group">
          <Input
            id="title"
            placeholder="Untitled Notice"
            value={input.title}
            onChange={(e) => setInput((prev => ({ ...prev, title: e.target.value })))}
            autoFocus={true}
            className="text-4xl sm:text-5xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-200 text-gray-900 h-auto py-2 bg-transparent transition-all"
          />
        </div>

        {/* Body Input */}
        <div className="flex-1 mb-8 group">
          <Textarea
            className="min-h-[400px] w-full text-lg resize-none border-none px-0 shadow-none focus-visible:ring-0 leading-loose text-gray-700 placeholder:text-gray-300 bg-transparent p-0"
            placeholder="Type '/' for commands or start writing..."
            value={input.body}
            onChange={(e) => setInput((prev => ({ ...prev, body: e.target.value })))}
          />
        </div>

        {/* Floating/Fixed Bottom Toolbar for Attachments */}
        <div className="sticky bottom-4 z-10 w-full bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl p-3 transition-all">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-tight">Add to post</span>

            <div className="h-4 w-px bg-gray-200 mx-1"></div>

            <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
              <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-lg px-3")}>
                <ImageIcon className="h-4 w-4" />
                <span className="font-medium">Image</span>
              </div>
            </MultipleImageUploader>
            <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
              <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer rounded-lg px-3")}>
                <FileText className="h-4 w-4" />
                <span className="font-medium">PDF</span>
              </div>
            </PdfUploader>

            {/* File Count Indicators if any */}
            {(imageFileContainers.length > 0) && (
              <div className="ml-auto flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full">
                <span>{imageFileContainers.length} files attached</span>
              </div>
            )}
          </div>

          {/* Expanded File Preview Area inside the toolbar or just above? */}
          {/* Putting it above avoids layout shifts in sticky. */}
        </div>

        {imageFileContainers.length > 0 && (
          <div className="mt-4 mb-20 flex-start w-full h-auto bg-gray-50 border border-gray-100 rounded-lg p-4">
            <div className="flex w-full gap-4 overflow-x-auto items-center p-1">
              {
                imageFileContainers?.map((imageFileContainer, i) => (
                  <UploadedImageFileCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImage(index)} />
                ))
              }
            </div>
          </div>
        )}

      </div>
    </BaseForm>
  )
}
