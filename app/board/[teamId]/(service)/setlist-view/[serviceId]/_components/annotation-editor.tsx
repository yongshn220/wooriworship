"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationEditorTargetAtom,
  AnnotationEditorTarget,
} from "../_states/annotation-states"
import { musicSheetAtom } from "@/global-states/music-sheet-state"
import { AnnotationToolbar } from "./annotation-toolbar"
import { AnnotationObjectMenu } from "./annotation-object-menu"
import { AnnotationMode } from "@/models/sheet_annotation"
import { clearUndoStackCache } from "../_hooks/use-annotation"
import { useEdgeSwipe } from "../_hooks/use-edge-swipe"
import { useNaturalDimensions } from "../_hooks/use-natural-dimensions"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
const AnnotationCanvas = dynamic(() => import("./annotation-canvas").then(mod => mod.AnnotationCanvas), { ssr: false })

// Props are kept for API compatibility but no longer used internally.
// The component now gets all info from annotationEditorTargetAtom.
interface Props {
  teamId: string
  serviceId: string
}

export function AnnotationEditor({ }: Props) {
  const editorTarget = useRecoilValue(annotationEditorTargetAtom)
  const setEditorTarget = useSetRecoilState(annotationEditorTargetAtom)
  const setDrawingMode = useSetRecoilState(annotationDrawingModeAtom)
  const annotationMode = useRecoilValue(annotationModeAtom)

  // Current page state - initialized from editorTarget
  const [currentPage, setCurrentPage] = useState<AnnotationEditorTarget | null>(editorTarget)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Get the current music sheet
  const currentSheet = useRecoilValue(musicSheetAtom({
    teamId: currentPage?.teamId || "",
    songId: currentPage?.songId || "",
    sheetId: currentPage?.sheetId || ""
  }))

  // Compute current image URL and probe natural dimensions
  const currentImageUrl = currentSheet?.urls?.[currentPage?.pageIndex ?? 0]
  const naturalDimensions = useNaturalDimensions(currentPage ? currentImageUrl : undefined)

  // Sync currentPage when editorTarget changes
  useEffect(() => {
    if (editorTarget) {
      setCurrentPage(editorTarget)
    }
  }, [editorTarget])

  // Set drawing mode on mount/unmount
  useEffect(() => {
    setDrawingMode(true)
    return () => {
      setDrawingMode(false)
    }
  }, [setDrawingMode])

  const handleClose = useCallback(() => {
    clearUndoStackCache()
    setEditorTarget(null)
  }, [setEditorTarget])

  const handlePrevPage = useCallback(() => {
    if (!currentPage) return

    if (currentPage.pageIndex > 0) {
      setCurrentPage(prev => prev ? { ...prev, pageIndex: prev.pageIndex - 1 } : null)
    } else {
      toast({ description: "첫 페이지입니다" })
    }
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    if (!currentPage || !currentSheet?.urls) return

    if (currentPage.pageIndex < currentSheet.urls.length - 1) {
      setCurrentPage(prev => prev ? { ...prev, pageIndex: prev.pageIndex + 1 } : null)
    } else {
      toast({ description: "마지막 페이지입니다" })
    }
  }, [currentPage, currentSheet])

  // Edge-swipe page navigation
  useEdgeSwipe({ wrapperRef, annotationMode, onPrevPage: handlePrevPage, onNextPage: handleNextPage })

  // Early return if no editor target or current page
  if (!editorTarget || !currentPage) return null
  if (!currentSheet?.urls || currentSheet.urls.length === 0) return null

  const imageUrl = currentSheet.urls[currentPage.pageIndex]
  if (!imageUrl) return null

  const totalPages = currentSheet.urls.length

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Unified Toolbar */}
      <AnnotationToolbar
        onClose={handleClose}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        currentPage={currentPage.pageIndex + 1}
        totalPages={totalPages}
      />

      {/* Object Context Menu */}
      <AnnotationObjectMenu />

      {/* Body */}
      <div ref={wrapperRef} className="flex-1 overflow-hidden relative" style={{ touchAction: "none" }}>
        <AnnotationCanvas
          teamId={currentPage.teamId}
          songId={currentPage.songId}
          sheetId={currentPage.sheetId}
          pageIndex={currentPage.pageIndex}
          isActiveSlide={true}
          naturalWidth={naturalDimensions.width}
          naturalHeight={naturalDimensions.height}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  )
}
