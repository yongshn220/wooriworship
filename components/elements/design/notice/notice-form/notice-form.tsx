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

import { NoticeService, StorageService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { toast } from "@/components/ui/use-toast";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import { UploadedImageFileCard } from "@/components/elements/util/image/uploaded-image-file-card";
import { ImageIcon, FileText, ArrowRight, ChevronLeft, Check, UploadCloud } from "lucide-react";
import { getPathNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FullScreenForm, FullScreenFormBody, FullScreenFormFooter, FullScreenFormHeader, FormSectionCard } from "@/components/common/form/full-screen-form";
import { slideVariants } from "@/components/constants/animations";

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

  // Form State
  const [step, setStep] = useState(0); // 0: Title, 1: Content, 2: Attachments
  const [direction, setDirection] = useState(0);
  const totalSteps = 3;

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
      const downloadUrls = await StorageService.uploadNoticeFiles(teamId, imageFileContainers)
      const noticeInput = {
        title: input.title,
        body: input.body,
        file_urls: downloadUrls
      }
      const noticeId = await NoticeService.addNewNotice(authUser.uid, teamId, noticeInput);
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
      await PushNotificationService.notifyTeamNewNotice(teamId, authUser.uid, input.title);
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

  // Navigation Logic
  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  }

  const nextStep = () => {
    if (step < totalSteps - 1) goToStep(step + 1);
  }

  const prevStep = () => {
    if (step > 0) goToStep(step - 1);
  }

  // Animation Variants

  return (
    <FullScreenForm>
      <FullScreenFormHeader
        steps={["Title", "Content", "Attachments"]}
        currentStep={step}
        onStepChange={goToStep}
        onClose={() => router.back()}
      />

      <FullScreenFormBody>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>

          {/* Step 0: Title */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-8 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 1</Label>
                <h2 className="text-2xl font-bold text-gray-900">What is this notice about?</h2>
              </div>

              <FormSectionCard className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-bold uppercase ml-1">Title</Label>
                  <Input
                    autoFocus
                    placeholder="Notice Title..."
                    value={input.title}
                    onChange={(e) => setInput(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl font-black bg-gray-50 border-gray-100 h-16 rounded-2xl focus-visible:ring-ring placeholder:text-gray-300"
                  />
                </div>
              </FormSectionCard>

            </motion.div>
          )}

          {/* Step 1: Content */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-8 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Step 2</Label>
                <h2 className="text-2xl font-bold text-gray-900">Details</h2>
                {input.title && <h3 className="text-xl font-medium text-primary break-words mt-2 px-4">{input.title}</h3>}
              </div>

              <FormSectionCard className="flex flex-col min-h-[300px]">
                <Textarea
                  className="w-full text-lg resize-none border-none px-0 shadow-none focus-visible:ring-0 leading-loose text-foreground placeholder:text-gray-300 bg-transparent p-0 min-h-[250px]"
                  placeholder="Start writing..."
                  value={input.body}
                  onChange={(e) => setInput((prev => ({ ...prev, body: e.target.value })))}
                />
              </FormSectionCard>

            </motion.div>
          )}

          {/* Step 2: Attachments */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col justify-center space-y-4 w-full"
            >
              <div className="space-y-4 text-center">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Final Step</Label>
                <h2 className="text-2xl font-bold text-gray-900">Attachments</h2>
              </div>

              <FormSectionCard className="space-y-6 flex flex-col overflow-hidden min-h-0 flex-1">

                {/* Upload Buttons */}
                <div className="flex items-center gap-4 justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
                    <div className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 cursor-pointer rounded-xl h-12 bg-white hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all")}>
                      <ImageIcon className="h-5 w-5" />
                      <span className="font-bold">Add Image</span>
                    </div>
                  </MultipleImageUploader>

                  <div className="h-8 w-px bg-gray-200"></div>

                  <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="w-auto">
                    <div className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 cursor-pointer rounded-xl h-12 bg-white hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all")}>
                      <FileText className="h-5 w-5" />
                      <span className="font-bold">Add PDF</span>
                    </div>
                  </PdfUploader>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[100px]">
                  {imageFileContainers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 py-8">
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

            </motion.div>
          )}

        </AnimatePresence>
      </FullScreenFormBody>

      <FullScreenFormFooter>
        <div className="w-12 h-12 flex-none">
          <Button variant="outline" className="h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground shadow-sm disabled:opacity-0 disabled:pointer-events-none transition-opacity duration-300" onClick={prevStep} disabled={step === 0}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <Button
          onClick={step === totalSteps - 1 ? (mode === FormMode.CREATE ? handleCreate : handleEdit) : nextStep}
          disabled={isLoading || (step === 0 && !input.title)}
          className="h-12 flex-1 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "Saving..." : step === totalSteps - 1 ? (mode === FormMode.CREATE ? "Publish Notice" : "Save Changes") : "Next Step"}
          {step === totalSteps - 1 ? <Check className="w-5 h-5 ml-1" /> : <ArrowRight className="w-5 h-5 ml-1" />}
        </Button>
      </FullScreenFormFooter>
    </FullScreenForm>
  )
}
