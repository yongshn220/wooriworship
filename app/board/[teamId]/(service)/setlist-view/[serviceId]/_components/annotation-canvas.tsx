"use client"

import { useRef, useEffect, useCallback, useState, useMemo } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  Canvas,
  PencilBrush,
  IText,
  Path,
  FabricObject,
  FabricImage,
  Point as FabricPoint,
} from "fabric"
import type { TEvent, TPointerEventInfo } from "fabric"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationColorAtom,
  annotationSizeAtom,
  annotationFontSizeAtom,
  annotationFontWeightAtom,
  activeAnnotationCanvasAtom,
  selectedAnnotationIdAtom,
  annotationSelectionBoundsAtom,
} from "../_states/annotation-states"
import {
  AnnotationMode,
  FreehandObject,
  TextObject,
  FreehandPoint,
} from "@/models/sheet_annotation"
import { useAnnotation } from "../_hooks/use-annotation"
import { useImageBounds } from "../_hooks/use-image-bounds"
import { useFabricCanvas, normalize } from "../_hooks/use-fabric-canvas"

// ---------------------------------------------------------------------------
// Type helper for accessing .data on Fabric objects (runtime property, not in TS defs)
// ---------------------------------------------------------------------------

type AnnotationData = { id: string; type: "freehand" | "text"; opacity?: number }

function getObjData(obj: FabricObject): AnnotationData | undefined {
  return (obj as unknown as Record<string, unknown>).data as AnnotationData | undefined
}

function setObjData(obj: FabricObject, data: AnnotationData): void {
  ;(obj as unknown as Record<string, unknown>).data = data
}

// ---------------------------------------------------------------------------
// Custom PencilBrush that captures raw points before decimation
// ---------------------------------------------------------------------------

class PointCapturingBrush extends PencilBrush {
  rawPoints: Array<{ x: number; y: number }> = []

  onMouseDown(pointer: FabricPoint, ev: TEvent): void {
    this.rawPoints = [{ x: pointer.x, y: pointer.y }]
    super.onMouseDown(pointer, ev)
  }

  onMouseMove(pointer: FabricPoint, ev: TEvent): void {
    this.rawPoints.push({ x: pointer.x, y: pointer.y })
    super.onMouseMove(pointer, ev)
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
  isActiveSlide: boolean
  naturalWidth: number
  naturalHeight: number
  imageUrl: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnnotationCanvas({
  teamId,
  songId,
  sheetId,
  pageIndex,
  isActiveSlide,
  naturalWidth,
  naturalHeight,
  imageUrl,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)

  // Recoil state
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const mode = useRecoilValue(annotationModeAtom)
  const color = useRecoilValue(annotationColorAtom)
  const penSize = useRecoilValue(annotationSizeAtom)
  const fontSize = useRecoilValue(annotationFontSizeAtom)
  const fontWeight = useRecoilValue(annotationFontWeightAtom)
  const setActiveCanvas = useSetRecoilState(activeAnnotationCanvasAtom)
  const selectedIds = useRecoilValue(selectedAnnotationIdAtom)
  const setSelectedIds = useSetRecoilState(selectedAnnotationIdAtom)
  const setMode = useSetRecoilState(annotationModeAtom)
  const setSelectionBounds = useSetRecoilState(annotationSelectionBoundsAtom)

  // Annotation data
  const {
    objects,
    addObject,
    removeObject,
    updateObject,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    isSaving,
    saveError,
  } = useAnnotation({ teamId, songId, sheetId, pageIndex })

  // Image bounds
  const bounds = useImageBounds(containerRef, naturalWidth, naturalHeight)

  const isInteractive = drawingMode

  // Fabric canvas lifecycle
  const { fabricCanvas, fabricObjectMap, skipNextSync, isReady } = useFabricCanvas({
    canvasElRef,
    containerRef,
    objects,
    bounds,
    interactive: isInteractive,
  })

  // Cancel flash state
  const [showCancelFlash, setShowCancelFlash] = useState(false)

  // Eraser state
  const isErasingRef = useRef(false)
  const erasedIdsRef = useRef(new Set<string>())

  // Pinch state
  const activePointersRef = useRef(new Map<number, PointerEvent>())
  const lastPinchDistanceRef = useRef<number | null>(null)
  const lastPinchCenterRef = useRef<{ x: number; y: number } | null>(null)
  const isPinchingRef = useRef(false)
  const wasDrawingModeRef = useRef(false)

  // Passthrough state for multi-touch
  const [shouldPassthrough, setShouldPassthrough] = useState(false)

  // Refs for stable callbacks
  const modeRef = useRef(mode)
  modeRef.current = mode
  const addObjectRef = useRef(addObject)
  addObjectRef.current = addObject
  const removeObjectRef = useRef(removeObject)
  removeObjectRef.current = removeObject
  const updateObjectRef = useRef(updateObject)
  updateObjectRef.current = updateObject
  const objectsRef = useRef(objects)
  objectsRef.current = objects
  const colorRef = useRef(color)
  colorRef.current = color
  const penSizeRef = useRef(penSize)
  penSizeRef.current = penSize
  const fontSizeRef = useRef(fontSize)
  fontSizeRef.current = fontSize
  const fontWeightRef = useRef(fontWeight)
  fontWeightRef.current = fontWeight
  const setSelectedIdsRef = useRef(setSelectedIds)
  setSelectedIdsRef.current = setSelectedIds
  const setModeRef = useRef(setMode)
  setModeRef.current = setMode
  const boundsRef = useRef(bounds)
  boundsRef.current = bounds
  const skipNextSyncRef = useRef(skipNextSync)
  skipNextSyncRef.current = skipNextSync
  const fabricObjectMapRef = useRef(fabricObjectMap)
  fabricObjectMapRef.current = fabricObjectMap
  const setSelectionBoundsRef = useRef(setSelectionBounds)
  setSelectionBoundsRef.current = setSelectionBounds

  // Compute selection bounds in screen coordinates
  const computeSelectionBounds = useCallback(() => {
    if (!fabricCanvas) return null
    const canvas = fabricCanvas as Canvas
    const active = canvas.getActiveObject()
    if (!active) return null
    const rect = active.getBoundingRect()
    const canvasEl = canvasElRef.current
    if (!canvasEl) return null
    const canvasRect = canvasEl.getBoundingClientRect()
    return {
      top: canvasRect.top + rect.top,
      left: canvasRect.left + rect.left,
      width: rect.width,
      height: rect.height,
    }
  }, [fabricCanvas])

  const computeSelectionBoundsRef = useRef(computeSelectionBounds)
  computeSelectionBoundsRef.current = computeSelectionBounds

  // Track if a new IText is being edited
  const isNewTextRef = useRef(false)
  const editingITextRef = useRef<IText | null>(null)

  // ---------------------------------------------------------------------------
  // Cancel flash auto-hide
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!showCancelFlash) return
    const timer = setTimeout(() => setShowCancelFlash(false), 600)
    return () => clearTimeout(timer)
  }, [showCancelFlash])

  // ---------------------------------------------------------------------------
  // Reset zoom/pan when page changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!fabricCanvas || !isReady) return
    const canvas = fabricCanvas as Canvas
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    canvas.requestRenderAll()
  }, [fabricCanvas, isReady, pageIndex])

  // ---------------------------------------------------------------------------
  // Background Image
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!fabricCanvas || !isReady || !imageUrl) return
    // Skip when bounds are zero — canvas is 0×0 so image would load at scale 0
    // (invisible). The effect re-runs once bounds become valid.
    if (bounds.visibleWidth === 0 || bounds.visibleHeight === 0) return
    const canvas = fabricCanvas as Canvas
    let cancelled = false

    FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
      if (cancelled) return
      const cw = canvas.width ?? 1
      const ch = canvas.height ?? 1
      const scaleX = cw / (img.width ?? 1)
      const scaleY = ch / (img.height ?? 1)
      const scale = Math.min(scaleX, scaleY)
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: cw / 2,
        top: ch / 2,
      })
      canvas.backgroundImage = img
      canvas.requestRenderAll()
    })

    return () => { cancelled = true }
  }, [fabricCanvas, isReady, imageUrl, bounds.visibleWidth, bounds.visibleHeight])

  // ---------------------------------------------------------------------------
  // Mode-specific setup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!fabricCanvas || !isReady) return
    const canvas = fabricCanvas as Canvas
    const disposers: (() => void)[] = []

    // Reset canvas interaction state
    canvas.isDrawingMode = false
    canvas.selection = false

    // Reset all objects to non-interactive by default
    canvas.getObjects().forEach((obj) => {
      obj.set({ selectable: false, evented: false })
    })

    // -----------------------------------------------------------------------
    // PEN / HIGHLIGHTER mode
    // -----------------------------------------------------------------------
    if (mode === AnnotationMode.PEN || mode === AnnotationMode.HIGHLIGHTER) {
      canvas.isDrawingMode = true
      const brush = new PointCapturingBrush(canvas)
      brush.color = color
      brush.width =
        mode === AnnotationMode.HIGHLIGHTER ? Math.max(penSize * 3, 12) : penSize
      brush.strokeLineCap = "round"
      brush.strokeLineJoin = "round"
      canvas.freeDrawingBrush = brush

      disposers.push(canvas.on("path:created", (e: { path: FabricObject }) => {
        const createdPath = e.path
        const capturingBrush = canvas.freeDrawingBrush as PointCapturingBrush
        const rawPts = capturingBrush.rawPoints || []

        if (rawPts.length < 2) {
          canvas.remove(createdPath)
          return
        }

        const b = boundsRef.current
        const normalizedPoints: FreehandPoint[] = rawPts.map((p) =>
          normalize(p, b),
        )

        const freehandObj: FreehandObject = {
          id: crypto.randomUUID(),
          type: "freehand",
          points: normalizedPoints,
          color: colorRef.current,
          strokeWidth:
            modeRef.current === AnnotationMode.HIGHLIGHTER
              ? Math.max(penSizeRef.current * 3, 12)
              : penSizeRef.current,
          opacity:
            modeRef.current === AnnotationMode.HIGHLIGHTER ? 0.3 : 1,
          timestamp: Date.now(),
        }

        // Register the Fabric-created path in our tracking map so it stays on canvas.
        // This avoids the remove+skip pattern that caused drawings to disappear.
        setObjData(createdPath, { id: freehandObj.id, type: "freehand", opacity: freehandObj.opacity })
        fabricObjectMapRef.current.current.set(freehandObj.id, createdPath)

        skipNextSyncRef.current.current = true
        addObjectRef.current(freehandObj)
      }))
    }

    // -----------------------------------------------------------------------
    // ERASER mode
    // -----------------------------------------------------------------------
    if (mode === AnnotationMode.ERASER) {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.getObjects().forEach((obj) => {
        obj.set({ selectable: false, evented: false })
      })
    }

    // -----------------------------------------------------------------------
    // TEXT mode
    // -----------------------------------------------------------------------
    if (mode === AnnotationMode.TEXT) {
      canvas.isDrawingMode = false
      canvas.selection = false

      // Make existing text objects clickable for editing
      canvas.getObjects().forEach((obj) => {
        const data = getObjData(obj)
        if (data?.type === "text") {
          obj.set({ selectable: false, evented: true })
        }
      })

      disposers.push(canvas.on("mouse:down", (opt: TPointerEventInfo) => {
        // If we clicked on an existing text object, enter editing
        if (opt.target) {
          const targetData = getObjData(opt.target)
          if (targetData?.type === "text" && opt.target instanceof IText) {
            const itext = opt.target
            itext.set({ selectable: true, evented: true })
            canvas.setActiveObject(itext)
            itext.enterEditing()
            isNewTextRef.current = false
            editingITextRef.current = itext
            return
          }
        }

        // If clicked on empty canvas, create new IText
        if (!opt.target) {
          const pointer = canvas.getScenePoint(opt.e)
          const newId = crypto.randomUUID()
          const fs = fontSizeRef.current
          const fw = fontWeightRef.current
          const c = colorRef.current

          const itext = new IText("", {
            left: pointer.x,
            top: pointer.y,
            fontSize: fs,
            fontWeight: fw,
            fill: c,
            selectable: true,
            evented: true,
          })
          setObjData(itext, { id: newId, type: "text" })

          // Override keyboard behavior
          const originalOnKeyDown = itext.onKeyDown.bind(itext)
          itext.onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              itext.exitEditing()
              return
            }
            if (e.key === "Escape") {
              e.preventDefault()
              e.stopPropagation()
              // Clear text to signal cancel
              itext.set({ text: "" })
              itext.exitEditing()
              return
            }
            originalOnKeyDown(e)
          }

          canvas.add(itext)
          canvas.setActiveObject(itext)
          itext.enterEditing()
          isNewTextRef.current = true
          editingITextRef.current = itext
        }
      }))

      disposers.push(canvas.on("text:editing:exited", (opt: { target: IText }) => {
        const itext = opt.target
        const data = getObjData(itext)
        const id = data?.id
        if (!id) return

        const text = (itext.text ?? "").trim()
        const b = boundsRef.current

        if (text === "") {
          // Empty text: remove from canvas and data
          canvas.remove(itext)
          fabricObjectMapRef.current.current.delete(id)
          if (isNewTextRef.current) {
            // New text that was never saved: no need to call removeObject
          } else {
            removeObjectRef.current(id)
          }
        } else {
          const nx = (itext.left ?? 0) / b.visibleWidth
          const ny = (itext.top ?? 0) / b.visibleHeight
          const nw = itext.width ? itext.width / b.visibleWidth : undefined

          const textObj: TextObject = {
            id,
            type: "text",
            x: nx,
            y: ny,
            text,
            fontSize: itext.fontSize ?? fontSizeRef.current,
            fontWeight: (itext.fontWeight as "normal" | "bold") ?? "normal",
            color: (itext.fill as string) ?? colorRef.current,
            width: nw,
            timestamp: Date.now(),
          }

          skipNextSyncRef.current.current = true
          if (isNewTextRef.current) {
            addObjectRef.current(textObj)
          } else {
            updateObjectRef.current(id, {
              text,
              x: nx,
              y: ny,
              width: nw,
            })
          }
          // Update fabricObjectMap
          fabricObjectMapRef.current.current.set(id, itext)
        }

        isNewTextRef.current = false
        editingITextRef.current = null

        // Non-sticky: revert to SELECT mode
        // We do this asynchronously to not interfere with Fabric's event cycle
        setTimeout(() => {
          setSelectedIdsRef.current([])
          setModeRef.current(AnnotationMode.SELECT)
        }, 0)
      }))
    }

    // -----------------------------------------------------------------------
    // SELECT mode
    // -----------------------------------------------------------------------
    if (mode === AnnotationMode.SELECT) {
      canvas.isDrawingMode = false
      canvas.selection = true

      canvas.getObjects().forEach((obj) => {
        const data = getObjData(obj)
        if (data?.type === "freehand") {
          obj.set({
            selectable: true,
            evented: true,
            lockRotation: true,
            hasControls: false,
          })
        } else if (data?.type === "text") {
          obj.set({
            selectable: true,
            evented: true,
            lockRotation: true,
          })
          // Horizontal resize handles only for text
          obj.setControlsVisibility({
            mt: false,
            mb: false,
            ml: true,
            mr: true,
            tl: false,
            tr: false,
            bl: false,
            br: false,
            mtr: false,
          })
        }
      })

      disposers.push(canvas.on("selection:created", (e: { selected: FabricObject[] }) => {
        const ids = e.selected
          .map((obj) => getObjData(obj)?.id)
          .filter((id): id is string => !!id)
        setSelectedIdsRef.current(ids)
        setSelectionBoundsRef.current(computeSelectionBoundsRef.current())
      }))

      disposers.push(canvas.on("selection:updated", (e: { selected: FabricObject[] }) => {
        const ids = e.selected
          .map((obj) => getObjData(obj)?.id)
          .filter((id): id is string => !!id)
        setSelectedIdsRef.current(ids)
        setSelectionBoundsRef.current(computeSelectionBoundsRef.current())
      }))

      disposers.push(canvas.on("selection:cleared", () => {
        setSelectedIdsRef.current([])
        setSelectionBoundsRef.current(null)
      }))

      // Double-click to edit text in SELECT mode
      disposers.push(canvas.on("mouse:dblclick", (opt: TPointerEventInfo) => {
        if (opt.target) {
          const targetData = getObjData(opt.target)
          if (targetData?.type === "text" && opt.target instanceof IText) {
            const itext = opt.target
            itext.enterEditing()
            isNewTextRef.current = false
            editingITextRef.current = itext
          }
        }
      }))

      // Real-time drag position updates for selection bounds
      disposers.push(canvas.on("object:moving", () => {
        setSelectionBoundsRef.current(computeSelectionBoundsRef.current())
      }))

      disposers.push(canvas.on("object:modified", (e: { target: FabricObject }) => {
        const obj = e.target
        const data = getObjData(obj)
        if (!data?.id) return

        const b = boundsRef.current
        const id = data.id

        if (data.type === "freehand" && obj instanceof Path) {
          // After drag: the path's left/top represent the displacement
          // We need to compute the offset and apply it to all normalized points
          const objLeft = obj.left ?? 0
          const objTop = obj.top ?? 0
          // Find original annotation object to get its original points
          const origObj = objectsRef.current.find((o) => o.id === id)
          if (origObj && origObj.type === "freehand") {
            // Calculate the delta in normalized space from original position
            // The path was created at the denormalized positions, so offset = current pos shift
            const dx = objLeft / b.visibleWidth
            const dy = objTop / b.visibleHeight
            if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
              const newPoints = origObj.points.map((p) => ({
                x: p.x + dx,
                y: p.y + dy,
              }))
              skipNextSyncRef.current.current = true
              updateObjectRef.current(id, { points: newPoints } as Partial<FreehandObject>)
            }
          }
        } else if (data.type === "text") {
          const nx = (obj.left ?? 0) / b.visibleWidth
          const ny = (obj.top ?? 0) / b.visibleHeight
          const nw = obj.width ? (obj.width * (obj.scaleX ?? 1)) / b.visibleWidth : undefined
          skipNextSyncRef.current.current = true
          updateObjectRef.current(id, {
            x: nx,
            y: ny,
            width: nw,
          } as Partial<TextObject>)
        }

        setSelectionBoundsRef.current(computeSelectionBoundsRef.current())
      }))

      // Register text editing:exited for SELECT mode too (for dblclick editing)
      disposers.push(canvas.on("text:editing:exited", (opt: { target: IText }) => {
        const itext = opt.target
        const data = getObjData(itext)
        if (!data?.id) return

        const id = data.id
        const text = (itext.text ?? "").trim()
        const b = boundsRef.current

        if (text === "") {
          canvas.remove(itext)
          fabricObjectMapRef.current.current.delete(id)
          removeObjectRef.current(id)
        } else {
          skipNextSyncRef.current.current = true
          updateObjectRef.current(id, {
            text,
            x: (itext.left ?? 0) / b.visibleWidth,
            y: (itext.top ?? 0) / b.visibleHeight,
          } as Partial<TextObject>)
        }

        isNewTextRef.current = false
        editingITextRef.current = null
      }))
    }

    canvas.requestRenderAll()

    // Cleanup: dispose all event listeners registered in this effect
    return () => {
      disposers.forEach(d => d())
    }
  }, [fabricCanvas, isReady, mode, color, penSize])

  // ---------------------------------------------------------------------------
  // Zoom/Pan: Ctrl+Wheel zoom, plain wheel pan
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!fabricCanvas || !isReady) return
    const canvas = fabricCanvas as Canvas

    const handleWheel = (opt: TPointerEventInfo<WheelEvent>) => {
      const e = opt.e
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY
        let zoom = canvas.getZoom()
        zoom *= 0.999 ** delta
        zoom = Math.min(Math.max(0.5, zoom), 5)
        canvas.zoomToPoint(new FabricPoint(e.offsetX, e.offsetY), zoom)
        e.preventDefault()
        e.stopPropagation()
      } else {
        // Pan
        canvas.relativePan(new FabricPoint(-e.deltaX, -e.deltaY))
        e.preventDefault()
      }
    }

    canvas.on("mouse:wheel", handleWheel)

    return () => {
      canvas.off("mouse:wheel", handleWheel)
    }
  }, [fabricCanvas, isReady])

  // ---------------------------------------------------------------------------
  // Eraser: pointer events on the wrapper div
  // ---------------------------------------------------------------------------

  const handleEraserPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (mode !== AnnotationMode.ERASER || !fabricCanvas) return
      const canvas = fabricCanvas as Canvas

      isErasingRef.current = true
      erasedIdsRef.current.clear()

      // Use getScenePoint to properly account for zoom/pan viewport transform
      const pointer = canvas.getScenePoint(e.nativeEvent)

      canvas.getObjects().forEach((obj) => {
        const data = getObjData(obj)
        if (!data?.id) return
        if (obj.containsPoint(pointer)) {
          erasedIdsRef.current.add(data.id)
          obj.set({ opacity: 0.3 })
        }
      })
      canvas.requestRenderAll()
    },
    [mode, fabricCanvas],
  )

  const handleEraserPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (mode !== AnnotationMode.ERASER || !isErasingRef.current || !fabricCanvas) return
      const canvas = fabricCanvas as Canvas

      // Use getScenePoint to properly account for zoom/pan viewport transform
      const pointer = canvas.getScenePoint(e.nativeEvent)

      canvas.getObjects().forEach((obj) => {
        const data = getObjData(obj)
        if (!data?.id || erasedIdsRef.current.has(data.id)) return
        if (obj.containsPoint(pointer)) {
          erasedIdsRef.current.add(data.id)
          obj.set({ opacity: 0.3 })
        }
      })
      canvas.requestRenderAll()
    },
    [mode, fabricCanvas],
  )

  const handleEraserPointerUp = useCallback(() => {
    if (mode !== AnnotationMode.ERASER || !isErasingRef.current) return
    isErasingRef.current = false

    const idsToRemove = Array.from(erasedIdsRef.current)
    erasedIdsRef.current.clear()

    if (idsToRemove.length > 0) {
      skipNextSyncRef.current.current = true
      for (const id of idsToRemove) {
        removeObject(id)
      }
    } else {
      // Restore opacity if nothing was erased
      if (fabricCanvas) {
        const canvas = fabricCanvas as Canvas
        canvas.getObjects().forEach((obj) => {
          const data = getObjData(obj)
          const origOpacity = data?.type === "freehand" ? (data.opacity ?? 1) : 1
          if (obj.opacity !== origOpacity) {
            obj.set({ opacity: origOpacity })
          }
        })
        canvas.requestRenderAll()
      }
    }
  }, [mode, fabricCanvas, removeObject])

  // ---------------------------------------------------------------------------
  // Pinch zoom on wrapper div
  // ---------------------------------------------------------------------------

  const handlePinchPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.set(e.pointerId, e.nativeEvent)

      if (activePointersRef.current.size >= 2 && fabricCanvas) {
        const canvas = fabricCanvas as Canvas
        isPinchingRef.current = true
        wasDrawingModeRef.current = canvas.isDrawingMode
        canvas.isDrawingMode = false
        setShouldPassthrough(true)
        setShowCancelFlash(false)
      }
    },
    [fabricCanvas],
  )

  const handlePinchPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.set(e.pointerId, e.nativeEvent)

      if (!isPinchingRef.current || activePointersRef.current.size < 2 || !fabricCanvas)
        return

      const canvas = fabricCanvas as Canvas
      const pointers = Array.from(activePointersRef.current.values())
      const [p1, p2] = pointers

      const dx = p2.clientX - p1.clientX
      const dy = p2.clientY - p1.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const centerX = (p1.clientX + p2.clientX) / 2
      const centerY = (p1.clientY + p2.clientY) / 2

      const rect = canvasElRef.current?.getBoundingClientRect()
      if (!rect) return

      const canvasCenterX = centerX - rect.left
      const canvasCenterY = centerY - rect.top

      if (lastPinchDistanceRef.current !== null && lastPinchCenterRef.current !== null) {
        const scaleFactor = distance / lastPinchDistanceRef.current
        let zoom = canvas.getZoom() * scaleFactor
        zoom = Math.min(Math.max(0.5, zoom), 5)
        canvas.zoomToPoint(new FabricPoint(canvasCenterX, canvasCenterY), zoom)

        const panDx = canvasCenterX - lastPinchCenterRef.current.x
        const panDy = canvasCenterY - lastPinchCenterRef.current.y
        canvas.relativePan(new FabricPoint(panDx, panDy))
      }

      lastPinchDistanceRef.current = distance
      lastPinchCenterRef.current = { x: canvasCenterX, y: canvasCenterY }
    },
    [fabricCanvas],
  )

  const handlePinchPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.delete(e.pointerId)

      if (activePointersRef.current.size < 2) {
        if (isPinchingRef.current && fabricCanvas) {
          const canvas = fabricCanvas as Canvas
          isPinchingRef.current = false
          lastPinchDistanceRef.current = null
          lastPinchCenterRef.current = null

          // Re-enable drawing mode if it was active
          if (
            wasDrawingModeRef.current &&
            (modeRef.current === AnnotationMode.PEN ||
              modeRef.current === AnnotationMode.HIGHLIGHTER)
          ) {
            canvas.isDrawingMode = true
          }

          if (activePointersRef.current.size === 0) {
            setShouldPassthrough(false)
          }
        }
      }
    },
    [fabricCanvas],
  )

  // ---------------------------------------------------------------------------
  // Safari gesture prevention
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const wrapper = containerRef.current
    if (!wrapper) return

    const preventGesture = (e: Event) => {
      e.preventDefault()
    }

    wrapper.addEventListener("gesturestart", preventGesture, { passive: false })
    wrapper.addEventListener("gesturechange", preventGesture, { passive: false })

    return () => {
      wrapper.removeEventListener("gesturestart", preventGesture)
      wrapper.removeEventListener("gesturechange", preventGesture)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Register active canvas callbacks for toolbar bridge
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isActiveSlide && drawingMode) {
      setActiveCanvas({
        undo,
        redo,
        clearAll,
        deleteSelected: () => {
          if (selectedIds.length > 0) {
            for (const id of selectedIds) {
              removeObject(id)
            }
            setSelectedIds([])
            if (fabricCanvas) {
              const canvas = fabricCanvas as Canvas
              canvas.discardActiveObject()
              canvas.requestRenderAll()
            }
          }
        },
        canUndo,
        canRedo,
        canClear: objects.length > 0,
        hasSelection: selectedIds.length > 0,
        isSaving,
        saveError,
        getSelectionBounds: () => {
          if (!fabricCanvas) return null
          const canvas = fabricCanvas as Canvas
          const active = canvas.getActiveObject()
          if (!active) return null
          const rect = active.getBoundingRect()
          const canvasEl = canvasElRef.current
          if (!canvasEl) return null
          const canvasRect = canvasEl.getBoundingClientRect()
          return {
            top: canvasRect.top + rect.top,
            left: canvasRect.left + rect.left,
            width: rect.width,
            height: rect.height,
          }
        },
      })
    }
    return () => {
      if (isActiveSlide) setActiveCanvas(null)
    }
  }, [
    isActiveSlide,
    drawingMode,
    canUndo,
    canRedo,
    objects.length,
    selectedIds,
    undo,
    redo,
    clearAll,
    removeObject,
    setActiveCanvas,
    setSelectedIds,
    isSaving,
    saveError,
    fabricCanvas,
  ])

  // Deselect when leaving drawing mode or changing mode
  useEffect(() => {
    if (!drawingMode) {
      setSelectedIds([])
      setSelectionBounds(null)
    }
  }, [drawingMode, setSelectedIds, setSelectionBounds])

  useEffect(() => {
    setSelectedIds([])
    setSelectionBounds(null)
    if (fabricCanvas) {
      const canvas = fabricCanvas as Canvas
      if (canvas.discardActiveObject) {
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
    }
  }, [mode, setSelectedIds, setSelectionBounds, fabricCanvas])

  // Reset eraser state when leaving eraser mode
  useEffect(() => {
    if (mode !== AnnotationMode.ERASER) {
      isErasingRef.current = false
      erasedIdsRef.current.clear()
    }
  }, [mode])

  // ---------------------------------------------------------------------------
  // Cursor style
  // ---------------------------------------------------------------------------

  const cursorStyle = useMemo(() => {
    switch (mode) {
      case AnnotationMode.PEN:
      case AnnotationMode.HIGHLIGHTER:
        return "crosshair"
      case AnnotationMode.TEXT:
        return "text"
      case AnnotationMode.ERASER:
        return "pointer"
      case AnnotationMode.SELECT:
      default:
        return "default"
    }
  }, [mode])

  // ---------------------------------------------------------------------------
  // Early returns
  // ---------------------------------------------------------------------------

  if (naturalWidth === 0 || naturalHeight === 0) return null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
      onPointerDown={(e) => {
        handlePinchPointerDown(e)
        handleEraserPointerDown(e)
      }}
      onPointerMove={(e) => {
        handlePinchPointerMove(e)
        handleEraserPointerMove(e)
      }}
      onPointerUp={(e) => {
        handlePinchPointerUp(e)
        handleEraserPointerUp()
      }}
      onPointerCancel={(e) => {
        handlePinchPointerUp(e)
        handleEraserPointerUp()
      }}
    >
      {/* Wrapper div positions the canvas area; Fabric v7 wraps the <canvas> in its
          own container with upper/lower canvases. Positioning the wrapper instead of
          the <canvas> directly avoids Fabric overriding our styles and creating a
          ~200px offset between pointer events (upper canvas) and rendering (lower canvas). */}
      <div
        style={{
          position: "absolute",
          top: bounds.offsetTop,
          left: bounds.offsetLeft,
          width: bounds.visibleWidth || 0,
          height: bounds.visibleHeight || 0,
          pointerEvents: isInteractive && !shouldPassthrough ? "auto" : "none",
          touchAction: isInteractive ? "none" : "auto",
          cursor: cursorStyle,
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
      {showCancelFlash && (
        <div
          className="absolute inset-0 bg-red-500/10 pointer-events-none z-30 animate-pulse"
          style={{ animationDuration: "0.3s", animationIterationCount: 1 }}
        />
      )}
    </div>
  )
}
