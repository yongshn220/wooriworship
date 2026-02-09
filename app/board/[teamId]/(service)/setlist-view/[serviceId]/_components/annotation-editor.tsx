"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationEditorTargetAtom,
} from "../_states/annotation-states"
import { setlistFlatPagesAtom, setlistIndexChangeEventAtom } from "../_states/setlist-view-states"
import { AnnotationToolbar } from "./annotation-toolbar"
import { AnnotationObjectMenu } from "./annotation-object-menu"
import { AnnotationMode } from "@/models/sheet_annotation"
import { clearUndoStackCache } from "../_hooks/use-annotation"
import dynamic from "next/dynamic"
const AnnotationCanvas = dynamic(() => import("./annotation-canvas").then(mod => mod.AnnotationCanvas), { ssr: false })

interface Props {
  teamId: string
}

export function AnnotationEditor({ teamId }: Props) {
  const flatPages = useRecoilValue(setlistFlatPagesAtom)
  const editorTarget = useRecoilValue(annotationEditorTargetAtom)
  const setEditorTarget = useSetRecoilState(annotationEditorTargetAtom)
  const setDrawingMode = useSetRecoilState(annotationDrawingModeAtom)
  const setIndexChangeEvent = useSetRecoilState(setlistIndexChangeEventAtom)
  const annotationMode = useRecoilValue(annotationModeAtom)

  // Initialize currentPageIndex from editorTarget so the first render already
  // shows the correct page (avoids a flash of page 0 → target page transition
  // that causes async race conditions in image loading).
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    if (editorTarget && flatPages.length > 0) {
      const idx = flatPages.findIndex((p) => p.globalIndex === editorTarget.initialGlobalIndex)
      return idx >= 0 ? idx : 0
    }
    return 0
  })
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Edge-swipe navigation state
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isEdgeSwipeRef = useRef(false)

  // Set drawing mode on mount/unmount
  useEffect(() => {
    setDrawingMode(true)
    return () => {
      setDrawingMode(false)
    }
  }, [setDrawingMode])

  // Sync initial page index from editor target
  useEffect(() => {
    if (editorTarget && flatPages.length > 0) {
      const idx = flatPages.findIndex((p) => p.globalIndex === editorTarget.initialGlobalIndex)
      setCurrentPageIndex(idx >= 0 ? idx : 0)
    }
  }, [editorTarget, flatPages])

  // Probe image natural dimensions (with cleanup to prevent stale callbacks)
  useEffect(() => {
    const page = flatPages[currentPageIndex]
    if (!page?.url) return
    let cancelled = false
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (!cancelled) {
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
    }
    img.src = page.url
    return () => { cancelled = true }
  }, [currentPageIndex, flatPages])

  const handleClose = useCallback(() => {
    // Sync carousel position before closing
    const page = flatPages[currentPageIndex]
    if (page) {
      setIndexChangeEvent(page.globalIndex)
    }
    clearUndoStackCache()
    setEditorTarget(null)
  }, [currentPageIndex, flatPages, setEditorTarget, setIndexChangeEvent])

  const handlePrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.min(flatPages.length - 1, prev + 1))
  }, [flatPages.length])

  // Edge-swipe page navigation
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const EDGE_THRESHOLD = 20 // pixels from edge
    const MIN_SWIPE_DISTANCE = 50 // pixels

    const handlePointerDown = (e: PointerEvent) => {
      // Only trigger in SELECT mode
      if (annotationMode !== AnnotationMode.SELECT) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const isLeftEdge = x <= EDGE_THRESHOLD
      const isRightEdge = x >= rect.width - EDGE_THRESHOLD

      if (isLeftEdge || isRightEdge) {
        isEdgeSwipeRef.current = true
        swipeStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isEdgeSwipeRef.current || !swipeStartRef.current) return
      // Track movement (could add visual feedback here if desired)
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isEdgeSwipeRef.current || !swipeStartRef.current) return

      const deltaX = e.clientX - swipeStartRef.current.x
      const deltaY = e.clientY - swipeStartRef.current.y
      const distance = Math.abs(deltaX)

      // Check if it's a horizontal swipe with sufficient distance
      if (distance >= MIN_SWIPE_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Swipe right → previous page
          handlePrevPage()
        } else {
          // Swipe left → next page
          handleNextPage()
        }
      }

      // Reset state
      isEdgeSwipeRef.current = false
      swipeStartRef.current = null
    }

    const handlePointerCancel = () => {
      isEdgeSwipeRef.current = false
      swipeStartRef.current = null
    }

    el.addEventListener("pointerdown", handlePointerDown)
    el.addEventListener("pointermove", handlePointerMove)
    el.addEventListener("pointerup", handlePointerUp)
    el.addEventListener("pointercancel", handlePointerCancel)

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown)
      el.removeEventListener("pointermove", handlePointerMove)
      el.removeEventListener("pointerup", handlePointerUp)
      el.removeEventListener("pointercancel", handlePointerCancel)
    }
  }, [annotationMode, handlePrevPage, handleNextPage])

  if (flatPages.length === 0) return null

  const page = flatPages[currentPageIndex]
  if (!page) return null

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Unified Toolbar */}
      <AnnotationToolbar
        onClose={handleClose}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        currentPage={currentPageIndex + 1}
        totalPages={flatPages.length}
      />

      {/* Object Context Menu */}
      <AnnotationObjectMenu />

      {/* Body */}
      <div ref={wrapperRef} className="flex-1 overflow-hidden relative" style={{ touchAction: "none" }}>
        <AnnotationCanvas
          teamId={page.teamId}
          songId={page.songId}
          sheetId={page.sheetId}
          pageIndex={page.pageIndex}
          isActiveSlide={true}
          naturalWidth={naturalDimensions.width}
          naturalHeight={naturalDimensions.height}
          imageUrl={page.url}
        />
      </div>
    </div>
  )
}
