"use client"

import { useRef, useEffect, useCallback, useState, useMemo } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { Stage, Layer, Line, Text, Rect, Transformer } from "react-konva"
import type Konva from "konva"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationColorAtom,
  annotationSizeAtom,
  annotationFontSizeAtom,
  annotationFontWeightAtom,
  activeAnnotationCanvasAtom,
  selectedAnnotationIdAtom,
} from "../_states/annotation-states"
import { AnnotationMode, AnnotationObject, FreehandObject, TextObject, FreehandPoint } from "@/models/sheet_annotation"
import { useAnnotation } from "../_hooks/use-annotation"
import { useImageBounds } from "../_hooks/use-image-bounds"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnnotationCanvas({
  teamId,
  songId,
  sheetId,
  pageIndex,
  isActiveSlide,
  currentScale,
  naturalWidth,
  naturalHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

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

  // Drawing state
  const [currentStroke, setCurrentStroke] = useState<number[] | null>(null)
  const currentStrokeRef = useRef<number[]>([])
  const isDrawingRef = useRef(false)
  const [showCancelFlash, setShowCancelFlash] = useState(false)

  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const isNewTextRef = useRef(false)
  const textareaElRef = useRef<HTMLTextAreaElement | null>(null)

  // Refs for stable access in native textarea event listeners
  const objectsRef = useRef(objects)
  objectsRef.current = objects
  const removeObjectRef = useRef(removeObject)
  removeObjectRef.current = removeObject
  const updateObjectRef = useRef(updateObject)
  updateObjectRef.current = updateObject

  // Multi-touch passthrough
  const pointerIdsRef = useRef(new Set<number>())
  const [passthroughMode, setPassthroughMode] = useState(false)

  // Marquee selection state
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)
  const isMarqueeRef = useRef(false)

  // Eraser state
  const isErasingRef = useRef(false)
  const erasedIdsRef = useRef(new Set<string>())
  const preEraseSnapshotRef = useRef<AnnotationObject[] | null>(null)

  const shouldPassthrough = passthroughMode
  const isInteractive = drawingMode

  // ---------------------------------------------------------------------------
  // Coordinate helpers
  // ---------------------------------------------------------------------------

  const denormalizePoints = useCallback(
    (points: FreehandPoint[]): number[] =>
      points.flatMap((p) => [p.x * bounds.visibleWidth, p.y * bounds.visibleHeight]),
    [bounds.visibleWidth, bounds.visibleHeight],
  )

  // ---------------------------------------------------------------------------
  // Cancel in-progress drawing
  // ---------------------------------------------------------------------------

  const cancelDrawing = useCallback(() => {
    const wasDrawing = isDrawingRef.current && currentStrokeRef.current.length > 0
    isDrawingRef.current = false
    currentStrokeRef.current = []
    setCurrentStroke(null)
    isMarqueeRef.current = false
    selectionStartRef.current = null
    setSelectionRect(null)
    isErasingRef.current = false
    erasedIdsRef.current.clear()
    preEraseSnapshotRef.current = null
    if (wasDrawing) {
      setShowCancelFlash(true)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Cancel flash auto-hide
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!showCancelFlash) return
    const timer = setTimeout(() => setShowCancelFlash(false), 600)
    return () => clearTimeout(timer)
  }, [showCancelFlash])

  // ---------------------------------------------------------------------------
  // Multi-touch passthrough: reset when all pointers released
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!passthroughMode) return

    const handleGlobalPointerUp = (e: PointerEvent) => {
      pointerIdsRef.current.delete(e.pointerId)
      if (pointerIdsRef.current.size === 0) {
        setPassthroughMode(false)
      }
    }

    document.addEventListener("pointerup", handleGlobalPointerUp)
    document.addEventListener("pointercancel", handleGlobalPointerUp)
    return () => {
      document.removeEventListener("pointerup", handleGlobalPointerUp)
      document.removeEventListener("pointercancel", handleGlobalPointerUp)
    }
  }, [passthroughMode])

  // ---------------------------------------------------------------------------
  // Konva container touchAction
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.container().style.touchAction = "none"
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Hover feedback helpers
  // ---------------------------------------------------------------------------

  const handleMouseEnter = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (mode === AnnotationMode.SELECT) {
        e.target.getStage()?.container().style.setProperty("cursor", "move")
      }
    },
    [mode],
  )

  const handleMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.target.getStage()?.container().style.setProperty("cursor", "default")
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // Object click (SELECT mode) — supports Shift+click multi-select
  // ---------------------------------------------------------------------------

  const handleObjectClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (mode !== AnnotationMode.SELECT) return
      e.cancelBubble = true
      const id = e.target.id()

      const nativeEvt = e.evt as MouseEvent
      if (nativeEvt.shiftKey) {
        // Toggle in/out of selection
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        )
      } else {
        setSelectedIds([id])
      }
    },
    [mode, setSelectedIds],
  )

  // ---------------------------------------------------------------------------
  // Text double-click -> edit
  // ---------------------------------------------------------------------------

  const handleTextDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true
      const id = e.target.id()
      const obj = objects.find((o) => o.id === id)
      if (!obj || obj.type !== "text") return
      isNewTextRef.current = false
      setEditingTextId(id)
    },
    [objects],
  )

  // ---------------------------------------------------------------------------
  // Drag end (SELECT mode)
  // ---------------------------------------------------------------------------

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      const id = node.id()
      const obj = objects.find((o) => o.id === id)
      if (!obj) return

      if (obj.type === "freehand") {
        const dx = node.x() / bounds.visibleWidth
        const dy = node.y() / bounds.visibleHeight
        const newPoints = (obj as FreehandObject).points.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        }))
        updateObject(obj.id, { points: newPoints } as Partial<FreehandObject>)
        node.position({ x: 0, y: 0 })
      } else if (obj.type === "text") {
        updateObject(obj.id, {
          x: node.x() / bounds.visibleWidth,
          y: node.y() / bounds.visibleHeight,
        } as Partial<TextObject>)
      }
    },
    [objects, bounds.visibleWidth, bounds.visibleHeight, updateObject],
  )

  // ---------------------------------------------------------------------------
  // Stage pointer handlers
  // ---------------------------------------------------------------------------

  const handleStagePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      const evt = e.evt
      pointerIdsRef.current.add(evt.pointerId)

      // Multi-touch -> passthrough for pinch-zoom
      if (pointerIdsRef.current.size >= 2) {
        cancelDrawing()
        setPassthroughMode(true)
        return
      }

      // Only respond to primary (left) mouse button
      if (evt.button !== 0) return

      const stage = stageRef.current
      if (!stage) return

      // SELECT mode
      if (mode === AnnotationMode.SELECT) {
        const clickedOnEmpty = e.target === stage
        if (clickedOnEmpty) {
          // Start marquee drag-select
          const pos = stage.getPointerPosition()
          if (pos) {
            selectionStartRef.current = { x: pos.x, y: pos.y }
            isMarqueeRef.current = true
            setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
          }
          if (!evt.shiftKey) {
            setSelectedIds([])
          }
        }
        return
      }

      // PEN mode: start stroke
      if (mode === AnnotationMode.PEN) {
        const pos = stage.getPointerPosition()
        if (!pos) return
        isDrawingRef.current = true
        currentStrokeRef.current = [pos.x, pos.y]
        setCurrentStroke([pos.x, pos.y])
        return
      }

      // HIGHLIGHTER mode: same as PEN
      if (mode === AnnotationMode.HIGHLIGHTER) {
        const pos = stage.getPointerPosition()
        if (!pos) return
        isDrawingRef.current = true
        currentStrokeRef.current = [pos.x, pos.y]
        setCurrentStroke([pos.x, pos.y])
        return
      }

      // TEXT mode
      if (mode === AnnotationMode.TEXT) {
        const clickedOnEmpty = e.target === stage
        if (clickedOnEmpty) {
          // If currently editing, just return — the outside click handler will save
          if (editingTextId) return

          const pos = stage.getPointerPosition()
          if (!pos) return

          const newId = crypto.randomUUID()
          const textObj: TextObject = {
            id: newId,
            type: "text",
            x: pos.x / bounds.visibleWidth,
            y: pos.y / bounds.visibleHeight,
            text: "",
            fontSize,
            fontWeight,
            color,
            timestamp: Date.now(),
          }
          addObject(textObj)
          isNewTextRef.current = true
          setEditingTextId(newId)
        }
        return
      }

      // ERASER mode: start erasing
      if (mode === AnnotationMode.ERASER) {
        isErasingRef.current = true
        erasedIdsRef.current.clear()
        preEraseSnapshotRef.current = [...objects]

        // Check if pointer is already over an object
        const pos = stage.getPointerPosition()
        if (pos) {
          const layer = stage.findOne("Layer") as Konva.Layer | null
          if (layer) {
            const hits = layer.getAllIntersections(pos)
            for (const node of hits) {
              const nodeId = node.id()
              if (nodeId && node.className !== "Transformer" && node.className !== "Rect") {
                erasedIdsRef.current.add(nodeId)
                node.opacity(0.3)
              }
            }
            layer.batchDraw()
          }
        }
        return
      }
    },
    [
      mode,
      cancelDrawing,
      setSelectedIds,
      bounds.visibleWidth,
      bounds.visibleHeight,
      fontSize,
      fontWeight,
      color,
      addObject,
      editingTextId,
      objects,
    ],
  )

  const handleStagePointerMove = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      // Marquee drag in SELECT mode
      if (mode === AnnotationMode.SELECT && isMarqueeRef.current && selectionStartRef.current) {
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (!pos) return

        const start = selectionStartRef.current
        setSelectionRect({
          x: Math.min(start.x, pos.x),
          y: Math.min(start.y, pos.y),
          width: Math.abs(pos.x - start.x),
          height: Math.abs(pos.y - start.y),
        })
        return
      }

      // ERASER mode: continuous hit detection
      if (mode === AnnotationMode.ERASER && isErasingRef.current) {
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (!pos) return
        const layer = stage.findOne("Layer") as Konva.Layer | null
        if (layer) {
          const hits = layer.getAllIntersections(pos)
          for (const node of hits) {
            const nodeId = node.id()
            if (nodeId && node.className !== "Transformer" && node.className !== "Rect" && !erasedIdsRef.current.has(nodeId)) {
              erasedIdsRef.current.add(nodeId)
              node.opacity(0.3)
              layer.batchDraw()
            }
          }
        }
        return
      }

      if ((mode !== AnnotationMode.PEN && mode !== AnnotationMode.HIGHLIGHTER) || !isDrawingRef.current) return

      const stage = stageRef.current
      if (!stage) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      currentStrokeRef.current = [...currentStrokeRef.current, pos.x, pos.y]
      setCurrentStroke([...currentStrokeRef.current])
    },
    [mode],
  )

  const handleStagePointerUp = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      const evt = e.evt
      pointerIdsRef.current.delete(evt.pointerId)

      // Marquee end in SELECT mode
      if (mode === AnnotationMode.SELECT && isMarqueeRef.current) {
        isMarqueeRef.current = false
        selectionStartRef.current = null

        if (selectionRect && (selectionRect.width > 3 || selectionRect.height > 3)) {
          const stage = stageRef.current
          if (stage) {
            const layer = stage.findOne("Layer") as Konva.Layer | null
            if (layer) {
              const hits: string[] = []
              layer.getChildren().forEach((node) => {
                const nodeId = node.id()
                if (!nodeId || node.className === "Transformer" || node.className === "Rect") return
                const rect = node.getClientRect({ relativeTo: stage })
                // Check intersection
                if (
                  rect.x < selectionRect.x + selectionRect.width &&
                  rect.x + rect.width > selectionRect.x &&
                  rect.y < selectionRect.y + selectionRect.height &&
                  rect.y + rect.height > selectionRect.y
                ) {
                  hits.push(nodeId)
                }
              })
              if (hits.length > 0) {
                setSelectedIds((prev) =>
                  evt.shiftKey ? Array.from(new Set([...prev, ...hits])) : hits,
                )
              }
            }
          }
        }
        setSelectionRect(null)
        return
      }

      // ERASER mode: batch delete erased objects
      if (mode === AnnotationMode.ERASER && isErasingRef.current) {
        isErasingRef.current = false
        const idsToRemove = Array.from(erasedIdsRef.current)
        erasedIdsRef.current.clear()

        if (idsToRemove.length > 0 && preEraseSnapshotRef.current) {
          // Push pre-erase snapshot for single undo entry, then set filtered objects
          // We need to directly manipulate the objects to achieve batch undo
          // Use removeObject for each (the undo snapshot was taken before first erase)
          for (const id of idsToRemove) {
            removeObject(id)
          }
        } else {
          // Restore opacity for objects that weren't deleted (shouldn't happen, but safety)
          const stage = stageRef.current
          if (stage) {
            const layer = stage.findOne("Layer") as Konva.Layer | null
            if (layer) {
              layer.getChildren().forEach((node) => {
                if (node.opacity() < 1) node.opacity(1)
              })
              layer.batchDraw()
            }
          }
        }
        preEraseSnapshotRef.current = null
        return
      }

      if ((mode !== AnnotationMode.PEN && mode !== AnnotationMode.HIGHLIGHTER) || !isDrawingRef.current) return

      isDrawingRef.current = false
      const points = currentStrokeRef.current

      if (points.length >= 2) {
        // Normalize all points
        const normalizedPoints: FreehandPoint[] = []
        for (let i = 0; i < points.length; i += 2) {
          normalizedPoints.push({
            x: points[i] / bounds.visibleWidth,
            y: points[i + 1] / bounds.visibleHeight,
          })
        }

        const freehandObj: FreehandObject = {
          id: crypto.randomUUID(),
          type: "freehand",
          points: normalizedPoints,
          color,
          strokeWidth: mode === AnnotationMode.HIGHLIGHTER ? Math.max(penSize * 3, 12) : penSize,
          opacity: mode === AnnotationMode.HIGHLIGHTER ? 0.3 : undefined,
          timestamp: Date.now(),
        }
        addObject(freehandObj)
      }

      currentStrokeRef.current = []
      setCurrentStroke(null)
    },
    [mode, selectionRect, bounds.visibleWidth, bounds.visibleHeight, color, penSize, addObject, removeObject, setSelectedIds],
  )

  // ---------------------------------------------------------------------------
  // Transformer attachment (multi-select)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) {
      return
    }
    if (selectedIds.length === 0) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
      return
    }

    const nodes: Konva.Node[] = []
    for (const id of selectedIds) {
      const node = stageRef.current.findOne(`#${id}`)
      if (node) nodes.push(node)
    }
    transformerRef.current.nodes(nodes)
    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedIds])

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
          }
        },
        canUndo,
        canRedo,
        canClear: objects.length > 0,
        hasSelection: selectedIds.length > 0,
        isSaving,
        saveError,
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
  ])

  // Deselect when leaving drawing mode or changing mode
  useEffect(() => {
    if (!drawingMode) {
      setSelectedIds([])
    }
  }, [drawingMode, setSelectedIds])

  useEffect(() => {
    setSelectedIds([])
  }, [mode, setSelectedIds])

  // Reset eraser state when leaving eraser mode
  useEffect(() => {
    if (mode !== AnnotationMode.ERASER) {
      isErasingRef.current = false
      erasedIdsRef.current.clear()
      preEraseSnapshotRef.current = null
    }
  }, [mode])

  // ---------------------------------------------------------------------------
  // Determine selected object type for Transformer anchors
  // ---------------------------------------------------------------------------

  const singleSelectedObj = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null
  const selectedObjectType = singleSelectedObj?.type ?? null

  // ---------------------------------------------------------------------------
  // Native DOM textarea for text editing (following Konva docs exactly)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!editingTextId || !stageRef.current) return

    const id = editingTextId
    const stage = stageRef.current
    let textarea: HTMLTextAreaElement | null = null
    let outsideClickHandler: ((e: MouseEvent) => void) | null = null

    const textNode = stage.findOne(`#${id}`) as Konva.Text | null
    if (!textNode) return

    // Hide the Konva text node while editing (Konva docs pattern)
    textNode.hide()
    stage.batchDraw()

    // Calculate position accounting for CSS transform (TransformWrapper zoom)
    const stageBox = stage.container().getBoundingClientRect()
    const textPosition = textNode.absolutePosition()
    const cssScale = stage.width() > 0 ? stageBox.width / stage.width() : 1

    const areaPosition = {
      x: stageBox.left + textPosition.x * cssScale,
      y: stageBox.top + textPosition.y * cssScale,
    }

    // Create native DOM textarea (Konva docs pattern)
    textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textareaElRef.current = textarea

    // Set value — handle placeholder space
    textarea.value = textNode.text() === " " ? "" : textNode.text()

    // Style to match Konva text node exactly
    textarea.style.position = "fixed"
    textarea.style.top = areaPosition.y + "px"
    textarea.style.left = areaPosition.x + "px"
    textarea.style.width = Math.max(textNode.width() * cssScale, 100) + "px"
    textarea.style.fontSize = textNode.fontSize() * cssScale + "px"
    textarea.style.border = "none"
    textarea.style.padding = "0px"
    textarea.style.margin = "0px"
    textarea.style.overflow = "hidden"
    textarea.style.background = "none"
    textarea.style.outline = "2px solid #3B82F6"
    textarea.style.outlineOffset = "2px"
    textarea.style.resize = "none"
    textarea.style.lineHeight = textNode.lineHeight().toString()
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.transformOrigin = "left top"
    textarea.style.textAlign = textNode.align()
    textarea.style.color = textNode.fill() as string
    textarea.style.fontWeight = textNode.fontStyle().includes("bold") ? "bold" : "normal"
    textarea.style.height = "auto"
    textarea.style.height = textarea.scrollHeight + 3 + "px"
    textarea.style.zIndex = "40"
    textarea.focus()

    // Cleanup helper
    function removeTextarea() {
      if (outsideClickHandler) {
        window.removeEventListener("mousedown", outsideClickHandler)
        outsideClickHandler = null
      }
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea)
      }
      textareaElRef.current = null
      textarea = null
      textNode.show()
      stage.batchDraw()
    }

    // Save text and close textarea
    function saveAndClose() {
      if (!textarea) return
      const value = textarea.value.trim()
      if (value === "") {
        removeObjectRef.current(id)
      } else {
        updateObjectRef.current(id, { text: value } as Partial<TextObject>)
      }
      removeTextarea()
      setEditingTextId(null)
      isNewTextRef.current = false
    }

    // Cancel edit and close textarea
    function cancelAndClose() {
      if (!textarea) return
      if (isNewTextRef.current) {
        const obj = objectsRef.current.find((o) => o.id === id)
        if (obj?.type === "text" && (obj as TextObject).text === "") {
          removeObjectRef.current(id)
        }
      }
      removeTextarea()
      setEditingTextId(null)
      isNewTextRef.current = false
    }

    // Keyboard: Enter saves, Escape cancels
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        saveAndClose()
      }
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        cancelAndClose()
      }
    })

    // Auto-resize textarea height
    textarea.addEventListener("input", function () {
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = textarea.scrollHeight + 3 + "px"
      }
    })

    // Outside mousedown saves (use mousedown, not click, to avoid same-click trigger)
    outsideClickHandler = function (e: MouseEvent) {
      if (e.target !== textarea) {
        saveAndClose()
      }
    }
    setTimeout(() => {
      if (outsideClickHandler) {
        window.addEventListener("mousedown", outsideClickHandler)
      }
    })

    // Cleanup: save text and remove textarea when editingTextId changes or unmount
    return () => {
      if (textarea) {
        const value = textarea.value.trim()
        if (value === "") {
          removeObjectRef.current(id)
        } else {
          updateObjectRef.current(id, { text: value } as Partial<TextObject>)
        }
      }
      if (outsideClickHandler) {
        window.removeEventListener("mousedown", outsideClickHandler)
      }
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea)
      }
      textareaElRef.current = null
      const tn = stageRef.current?.findOne(`#${id}`) as Konva.Text | null
      if (tn) {
        tn.show()
        stageRef.current?.batchDraw()
      }
    }
  }, [editingTextId])

  // ---------------------------------------------------------------------------
  // Cursor style based on annotation mode
  // ---------------------------------------------------------------------------

  const cursorStyle = useMemo(() => {
    switch (mode) {
      case AnnotationMode.PEN:
        return "crosshair"
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
    >
      <Stage
        ref={stageRef}
        width={bounds.visibleWidth}
        height={bounds.visibleHeight}
        listening={isInteractive && !shouldPassthrough}
        style={{
          position: "absolute",
          top: bounds.offsetTop,
          left: bounds.offsetLeft,
          pointerEvents: isInteractive && !shouldPassthrough ? "auto" : "none",
          touchAction: isInteractive ? "none" : "auto",
          cursor: cursorStyle,
        }}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer listening={isActiveSlide}>
          {/* Saved freehand strokes */}
          {bounds.visibleWidth > 0 &&
            objects
              .filter((obj): obj is FreehandObject => obj.type === "freehand")
              .map((obj) => (
                <Line
                  key={obj.id}
                  id={obj.id}
                  points={denormalizePoints(obj.points)}
                  stroke={obj.color}
                  strokeWidth={obj.strokeWidth}
                  opacity={obj.opacity ?? 1}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.3}
                  draggable={mode === AnnotationMode.SELECT}
                  onClick={mode === AnnotationMode.SELECT ? handleObjectClick : undefined}
                  onTap={mode === AnnotationMode.SELECT ? handleObjectClick : undefined}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  hitStrokeWidth={20}
                />
              ))}

          {/* Saved text objects */}
          {bounds.visibleWidth > 0 &&
            objects
              .filter((obj): obj is TextObject => obj.type === "text")
              .map((obj) => (
                <Text
                  key={obj.id}
                  id={obj.id}
                  x={obj.x * bounds.visibleWidth}
                  y={obj.y * bounds.visibleHeight}
                  text={obj.text || " "}
                  fontSize={obj.fontSize}
                  fontStyle={obj.fontWeight === "bold" ? "bold" : "normal"}
                  fill={obj.color}
                  width={obj.width ? obj.width * bounds.visibleWidth : undefined}
                  draggable={mode === AnnotationMode.SELECT}
                  onClick={(e) => {
                    if (mode === AnnotationMode.SELECT) {
                      handleObjectClick(e)
                    } else if (mode === AnnotationMode.TEXT) {
                      e.cancelBubble = true
                      e.evt.stopPropagation()
                      if (editingTextId === obj.id) return
                      isNewTextRef.current = false
                      setEditingTextId(obj.id)
                    }
                  }}
                  onTap={(e) => {
                    if (mode === AnnotationMode.SELECT) {
                      handleObjectClick(e as unknown as Konva.KonvaEventObject<MouseEvent | TouchEvent>)
                    } else if (mode === AnnotationMode.TEXT) {
                      e.cancelBubble = true
                      if (editingTextId === obj.id) return
                      isNewTextRef.current = false
                      setEditingTextId(obj.id)
                    }
                  }}
                  onDblClick={handleTextDblClick}
                  onDblTap={handleTextDblClick}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              ))}

          {/* In-progress stroke */}
          {currentStroke && currentStroke.length >= 4 && (
            <Line
              points={currentStroke}
              stroke={color}
              strokeWidth={mode === AnnotationMode.HIGHLIGHTER ? Math.max(penSize * 3, 12) : penSize}
              opacity={mode === AnnotationMode.HIGHLIGHTER ? 0.3 : 1}
              lineCap="round"
              lineJoin="round"
              tension={0.3}
              listening={false}
            />
          )}

          {/* Marquee selection rectangle */}
          {selectionRect && (selectionRect.width > 1 || selectionRect.height > 1) && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth={1 / currentScale}
              dash={[6 / currentScale, 3 / currentScale]}
              listening={false}
            />
          )}

          {/* Transformer for selected objects */}
          {selectedIds.length > 0 && mode === AnnotationMode.SELECT && (
            <Transformer
              ref={transformerRef}
              enabledAnchors={
                selectedObjectType === "text"
                  ? ["middle-left", "middle-right"]
                  : []
              }
              rotateEnabled={false}
              anchorSize={8 / currentScale}
              borderStrokeWidth={1.5 / currentScale}
              boundBoxFunc={(oldBox, newBox) => {
                // Prevent negative dimensions
                if (newBox.width < 5 || newBox.height < 5) return oldBox
                return newBox
              }}
            />
          )}
        </Layer>
      </Stage>
      {showCancelFlash && (
        <div
          className="absolute inset-0 bg-red-500/10 pointer-events-none z-30 animate-pulse"
          style={{ animationDuration: "0.3s", animationIterationCount: 1 }}
        />
      )}
    </div>
  )
}
