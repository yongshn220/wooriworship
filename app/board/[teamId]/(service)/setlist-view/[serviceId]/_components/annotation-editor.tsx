"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Loader2, Check, AlertCircle } from "lucide-react"
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import {
  annotationDrawingModeAtom,
  annotationEditorTargetAtom,
  activeAnnotationCanvasAtom,
} from "../_states/annotation-states"
import { setlistFlatPagesAtom, setlistIndexChangeEventAtom } from "../_states/setlist-view-states"
import { AnnotationToolbar } from "./annotation-toolbar"
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
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)

  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentScale, setCurrentScale] = useState(1)
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  // Poll for image dimensions (cached images may not fire onLoad)
  useEffect(() => {
    if (naturalDimensions.width > 0) return

    let mounted = true
    const checkDimensions = () => {
      const img = contentRef.current?.querySelector('img[alt="Music score"]') as HTMLImageElement | null
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0 && mounted) {
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        return true
      }
      return false
    }

    if (checkDimensions()) return

    const interval = setInterval(() => {
      if (checkDimensions()) clearInterval(interval)
    }, 100)

    const timeout = setTimeout(() => clearInterval(interval), 5000)

    return () => {
      mounted = false
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [currentPageIndex, naturalDimensions.width])

  // Custom wheel handler for scroll pan (non-zoom wheel)
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return
      e.preventDefault()
      const ref = transformRef.current
      if (!ref) return
      const { positionX, positionY, scale } = ref.state
      ref.setTransform(positionX - e.deltaX, positionY - e.deltaY, scale, 0)
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  // Prevent Safari native pinch-zoom gestures
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const prevent = (e: Event) => e.preventDefault()
    el.addEventListener("gesturestart", prevent, { passive: false })
    el.addEventListener("gesturechange", prevent, { passive: false })
    return () => {
      el.removeEventListener("gesturestart", prevent)
      el.removeEventListener("gesturechange", prevent)
    }
  }, [])

  const handleClose = useCallback(() => {
    // Sync carousel position before closing
    const page = flatPages[currentPageIndex]
    if (page) {
      setIndexChangeEvent(page.globalIndex)
    }
    setEditorTarget(null)
  }, [currentPageIndex, flatPages, setEditorTarget, setIndexChangeEvent])

  const handlePrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1))
    setNaturalDimensions({ width: 0, height: 0 })
    transformRef.current?.resetTransform(0)
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.min(flatPages.length - 1, prev + 1))
    setNaturalDimensions({ width: 0, height: 0 })
    transformRef.current?.resetTransform(0)
  }, [flatPages.length])

  if (flatPages.length === 0) return null

  const page = flatPages[currentPageIndex]
  if (!page) return null

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium tabular-nums min-w-[48px] text-center">
            {currentPageIndex + 1} / {flatPages.length}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === flatPages.length - 1}
            className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="w-9 flex items-center justify-center">
          {activeCanvas?.isSaving && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {activeCanvas && !activeCanvas.isSaving && activeCanvas.saveError && (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          {activeCanvas && !activeCanvas.isSaving && !activeCanvas.saveError && (
            <Check className="w-4 h-4 text-muted-foreground/50" />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative py-2 flex justify-center border-b border-border bg-background">
        <AnnotationToolbar />
      </div>

      {/* Body */}
      <div ref={wrapperRef} className="flex-1 overflow-hidden relative" style={{ touchAction: "none" }}>
        <TransformWrapper
          ref={transformRef}
          key={`${page.sheetId}_${page.pageIndex}`}
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit={true}
          wheel={{ activationKeys: ["Control", "Meta"], step: 0.07 }}
          panning={{
            allowLeftClickPan: false,
            allowMiddleClickPan: true,
            allowRightClickPan: false,
          }}
          doubleClick={{ disabled: true }}
          pinch={{ disabled: false }}
          onTransformed={(e) => {
            setCurrentScale(e.state.scale)
          }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            <div
              ref={contentRef}
              className="relative w-full h-full select-none"
              style={{ WebkitTouchCallout: "none" }}
            >
              <Image
                alt="Music score"
                src={page.url}
                fill
                sizes="100vw"
                className="object-contain select-none pointer-events-none"
                onLoad={(e) => {
                  const img = e.currentTarget as HTMLImageElement
                  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
                  }
                }}
              />
              <AnnotationCanvas
                teamId={page.teamId}
                songId={page.songId}
                sheetId={page.sheetId}
                pageIndex={page.pageIndex}
                isActiveSlide={true}
                currentScale={currentScale}
                naturalWidth={naturalDimensions.width}
                naturalHeight={naturalDimensions.height}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

    </div>
  )
}
