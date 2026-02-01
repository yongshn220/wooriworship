"use client"

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
import { noticeAtom, noticeUpdaterAtom, noticeIdsUpdaterAtom } from "@/global-states/notice-state";

import { NoticeApi, StorageApi } from "@/apis";
import PushNotificationApi from "@/apis/PushNotificationApi";
import { toast } from "@/components/ui/use-toast";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import { UploadedImageFileCard } from "@/components/elements/util/image/uploaded-image-file-card";
import { ImageIcon, FileText, Check, UploadCloud } from "lucide-react";
import { getPathNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { FullScreenForm, FullScreenFormBody, FullScreenFormFooter, FullScreenFormHeader, FormSectionCard } from "@/components/common/form/full-screen-form";

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
  const notice = useRecoilValue(noticeAtom({ teamId, noticeId: noticeId || "" }))

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
      setIsLoading(true)
      const curImageUrls = imageFileContainers.map(item => item.url)
      const filesToAdd = imageFileContainers.filter(item => !!item.id) as Array<ImageFileContainer>
      const urlsToDelete = notice.file_urls.filter(url => !curImageUrls.includes(url))
      let urlsToKeep = notice.file_urls.filter(url => curImageUrls.includes(url))
      const newDownloadUrls = await StorageApi.updateNoticeFiles(teamId, filesToAdd, urlsToDelete);
      if (newDownloadUrls.length > 0) {
        urlsToKeep = urlsToKeep.concat(newDownloadUrls)
      }
      const noticeInput = {
        title: input?.title,
        body: input?.body,
        file_urls: urlsToKeep
      }
      if (await NoticeApi.updateNotice(teamId, noticeId, noticeInput) === false) {
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
      console.error(e);
      toast({ description: "An error occurred." });
    }
    finally {
      setIsLoading(false)
      clearContents()
    }
  }

  async function handleCreate() {
    setIsLoading(true)
    try {
      const downloadUrls = await StorageApi.uploadNoticeFiles(teamId, imageFileContainers)
      const noticeInput = {
        title: input.title,
        body: input.body,
        file_urls: downloadUrls
      }
      const noticeId = await NoticeApi.addNewNotice(authUser.uid, teamId, noticeInput);
      if (!noticeId) {
        toast({
          description: "Fail to create notice-board. Please try again."
        })
        return
      }

      toast({
        title: `New Notice created!`,
        description: input.title,
      })
      await PushNotificationApi.notifyTeamNewNotice(teamId, authUser.uid, input.title);
      setNoticeIdsUpdater((prev) => prev + 1)

      clearContents()
      router.push(getPathNotice(teamId))
    }
    catch (e) {
      console.error(e);
      toast({ description: "An error occurred." });
    }
    finally {
      setIsLoading(false)
      clearContents()
    }
  }

  return (
    <FullScreenForm data-testid="notice-form">
      <FullScreenFormHeader
        steps={[mode === FormMode.CREATE ? "New Notice" : "Edit Notice"]}
        currentStep={0}
        onStepChange={() => {}}
        onClose={() => router.back()}
      />

      <FullScreenFormBody>
        <div className="space-y-6 w-full">

          {/* Title Section */}
          <FormSectionCard className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Title</Label>
              <Input
                autoFocus
                placeholder="Notice Title..."
                value={input.title}
                onChange={(e) => setInput(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-black bg-secondary/40 border-border h-16 rounded-2xl focus-visible:ring-ring placeholder:text-muted-foreground/40"
                data-testid="notice-title-input"
              />
            </div>
          </FormSectionCard>

          {/* Content Section */}
          <FormSectionCard className="flex flex-col min-h-[300px]">
            <div className="space-y-2 flex flex-col flex-1">
              <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Content</Label>
              <Textarea
                className="w-full text-lg resize-none border-none px-0 shadow-none focus-visible:ring-0 leading-loose text-foreground placeholder:text-muted-foreground/40 bg-transparent p-0 min-h-[250px]"
                placeholder="Start writing..."
                value={input.body}
                onChange={(e) => setInput((prev => ({ ...prev, body: e.target.value })))}
                data-testid="notice-body-input"
              />
            </div>
          </FormSectionCard>

          {/* Attachments Section */}
          <FormSectionCard className="space-y-6 flex flex-col">
            <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Attachments</Label>

            {/* Upload Buttons */}
            <div className="flex items-center gap-4 justify-center p-4 bg-muted/30 rounded-2xl border border-dashed border-border">
              <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
                <div className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 cursor-pointer rounded-xl h-12 bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all")}>
                  <ImageIcon className="h-5 w-5" />
                  <span className="font-bold">Add Image</span>
                </div>
              </MultipleImageUploader>

              <div className="h-8 w-px bg-border"></div>

              <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
                <div className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 cursor-pointer rounded-xl h-12 bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all")}>
                  <FileText className="h-5 w-5" />
                  <span className="font-bold">Add PDF</span>
                </div>
              </PdfUploader>
            </div>

            <div className="min-h-[100px]">
              {imageFileContainers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-2 py-8">
                  <UploadCloud className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">No files attached</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {
                    imageFileContainers?.map((imageFileContainer, i) => (
                      <UploadedImageFileCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImage(index)} />
                    ))
                  }
                </div>
              )}
            </div>
          </FormSectionCard>

        </div>
      </FullScreenFormBody>

      <FullScreenFormFooter>
        <Button
          onClick={mode === FormMode.CREATE ? handleCreate : handleEdit}
          disabled={isLoading || !input.title}
          className="h-12 flex-1 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
          data-testid="form-submit"
        >
          {isLoading ? "Saving..." : mode === FormMode.CREATE ? "Publish Notice" : "Save Changes"}
          <Check className="w-5 h-5 ml-1" />
        </Button>
      </FullScreenFormFooter>
    </FullScreenForm>
  )
}
