"use client"

import { useRef, useEffect, useCallback } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { annotationDrawingModeAtom, annotationToolAtom, annotationColorAtom, annotationSizeAtom, activeAnnotationCanvasAtom } from "../_states/annotation-states"
import { DrawingTool, Stroke } from "@/models/sheet_annotation"
import { useAnnotation } from "../_hooks/use-annotation"
import { useDrawingInteraction } from "../_hooks/use-drawing-interaction"
import { useImageBounds } from "../_hooks/use-image-bounds"
import { getStrokePath, isPointNearStroke, toNormalizedPoint, strokeToPixels, strokeToNormalized } from "../_utils/stroke-utils"

interface Props {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
  isActiveSlide: boolean
  currentScale: number
  naturalWidth: number
  naturalHeight: number
}

export function AnnotationCanvas({ teamId, songId, sheetId, pageIndex, isActiveSlide, currentScale, naturalWidth, naturalHeight }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const tool = useRecoilValue(annotationToolAtom)
  const color = useRecoilValue(annotationColorAtom)
  const size = useRecoilValue(annotationSizeAtom)
  const setActiveCanvas = useSetRecoilState(activeAnnotationCanvasAtom)

  const { strokes, addStroke, removeStroke, undo, redo, clearAll, canUndo, canRedo } = useAnnotation({ teamId, songId, sheetId, pageIndex })
  const bounds = useImageBounds(containerRef, naturalWidth, naturalHeight)

  const handleStrokeComplete = useCallback((pixelStroke: Stroke) => {
    if (bounds.visibleWidth === 0 || bounds.visibleHeight === 0) return
    const normalizedStroke = strokeToNormalized(pixelStroke, bounds.visibleWidth, bounds.visibleHeight)
    addStroke(normalizedStroke)
  }, [addStroke, bounds.visibleWidth, bounds.visibleHeight])

  const { currentStroke, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave } = useDrawingInteraction({
    svgRef,
    color,
    size,
    onStrokeComplete: handleStrokeComplete,
  })

  // Register active canvas callbacks for toolbar undo/redo bridge
  useEffect(() => {
    if (isActiveSlide && drawingMode) {
      setActiveCanvas({ undo, redo, clearAll, canUndo, canRedo, canClear: strokes.length > 0 })
    }
    return () => {
      if (isActiveSlide) setActiveCanvas(null)
    }
  }, [isActiveSlide, drawingMode, canUndo, canRedo, strokes.length, undo, redo, clearAll, setActiveCanvas])

  // Eraser: handle pointer events for hit-testing
  const handleEraserPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const point = toNormalizedPoint(e.clientX, e.clientY, rect, 0.5)

    for (const stroke of strokes) {
      if (isPointNearStroke(point, stroke, 0.03)) {
        removeStroke(stroke.id)
        break
      }
    }
  }, [strokes, removeStroke])

  const isPen = tool === DrawingTool.PEN
  const isEraser = tool === DrawingTool.ERASER
  const isInteractive = drawingMode

  // Don't render if image hasn't loaded yet
  if (naturalWidth === 0 || naturalHeight === 0) return null
  // Note: We don't check bounds here because the containerRef only exists after first render
  // The SVG will just be invisible (0x0) until ResizeObserver updates the bounds

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
    >
      <svg
        ref={svgRef}
        className="absolute"
        style={{
          top: bounds.offsetTop,
          left: bounds.offsetLeft,
          width: bounds.visibleWidth,
          height: bounds.visibleHeight,
          pointerEvents: isInteractive ? "auto" : "none",
          touchAction: isInteractive ? "none" : "auto",
        }}
        onPointerDown={isInteractive ? (isPen ? handlePointerDown : handleEraserPointerDown) : undefined}
        onPointerMove={isInteractive && isPen ? handlePointerMove : undefined}
        onPointerUp={isInteractive && isPen ? handlePointerUp : undefined}
        onPointerLeave={isInteractive && isPen ? handlePointerLeave : undefined}
      >
        {/* Saved strokes */}
        {bounds.visibleWidth > 0 && strokes.map((stroke) => {
          const pixelStroke = strokeToPixels(stroke, bounds.visibleWidth, bounds.visibleHeight)
          return (
            <path
              key={stroke.id}
              d={getStrokePath(pixelStroke, true)}
              fill={stroke.color}
            />
          )
        })}

        {/* In-progress stroke */}
        {bounds.visibleWidth > 0 && currentStroke && isPen && (
          <path
            d={getStrokePath(currentStroke, false)}
            fill={currentStroke.color}
            opacity={0.7}
          />
        )}
      </svg>
    </div>
  )
}
