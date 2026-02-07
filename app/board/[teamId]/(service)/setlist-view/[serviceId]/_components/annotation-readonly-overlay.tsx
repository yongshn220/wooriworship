"use client"

import { useRef, useEffect } from "react"
import { StaticCanvas, Path, FabricText } from "fabric"
import { FreehandObject, TextObject } from "@/models/sheet_annotation"
import { useAnnotation } from "../_hooks/use-annotation"
import { useImageBounds } from "../_hooks/use-image-bounds"

interface Props {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
  naturalWidth: number
  naturalHeight: number
}

export function AnnotationReadonlyOverlay({
  teamId,
  songId,
  sheetId,
  pageIndex,
  naturalWidth,
  naturalHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<StaticCanvas | null>(null)
  const bounds = useImageBounds(containerRef, naturalWidth, naturalHeight)

  const { objects } = useAnnotation({ teamId, songId, sheetId, pageIndex })

  // Initialize Fabric canvas
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!canvasRef.current) return

    // Create static canvas
    const canvas = new StaticCanvas(canvasRef.current, {
      width: bounds.visibleWidth,
      height: bounds.visibleHeight,
      selection: false,
      renderOnAddRemove: false,
    })

    fabricCanvasRef.current = canvas

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only initialize once

  // Update canvas dimensions when bounds change
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    canvas.setDimensions({
      width: bounds.visibleWidth,
      height: bounds.visibleHeight,
    })
    canvas.renderAll()
  }, [bounds.visibleWidth, bounds.visibleHeight])

  // Render objects when they change
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    if (bounds.visibleWidth === 0 || bounds.visibleHeight === 0) return

    // Clear existing objects
    canvas.clear()

    const w = bounds.visibleWidth
    const h = bounds.visibleHeight

    // Render freehand objects as paths
    objects
      .filter((obj): obj is FreehandObject => obj.type === "freehand")
      .forEach((obj) => {
        if (obj.points.length < 2) return

        // Build SVG path string from normalized points
        const pathData = obj.points
          .map((p, i) => {
            const x = p.x * w
            const y = p.y * h
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
          })
          .join(" ")

        const path = new Path(pathData, {
          stroke: obj.color,
          strokeWidth: obj.strokeWidth,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          fill: "",
          opacity: obj.opacity ?? 1,
          selectable: false,
          evented: false,
        })

        canvas.add(path)
      })

    // Render text objects
    objects
      .filter((obj): obj is TextObject => obj.type === "text")
      .forEach((obj) => {
        const text = new FabricText(obj.text, {
          left: obj.x * w,
          top: obj.y * h,
          fontSize: obj.fontSize,
          fontWeight: obj.fontWeight,
          fill: obj.color,
          width: obj.width ? obj.width * w : undefined,
          selectable: false,
          evented: false,
        })

        canvas.add(text)
      })

    canvas.renderAll()
  }, [objects, bounds.visibleWidth, bounds.visibleHeight])

  if (naturalWidth === 0 || naturalHeight === 0) return null
  if (objects.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: bounds.offsetTop,
          left: bounds.offsetLeft,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
