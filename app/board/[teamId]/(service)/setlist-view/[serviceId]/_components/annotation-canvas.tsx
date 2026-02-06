"use client"

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react"
import { createPortal } from "react-dom"
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
import { AnnotationMode, FreehandObject, TextObject, FreehandPoint } from "@/models/sheet_annotation"
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
  } = useAnnotation({ teamId, songId, sheetId, pageIndex })

  // Image bounds
  const bounds = useImageBounds(containerRef, naturalWidth, naturalHeight)

  // Drawing state
  const [currentStroke, setCurrentStroke] = useState<number[] | null>(null)
  const currentStrokeRef = useRef<number[]>([])
  const isDrawingRef = useRef(false)

  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editTextValue, setEditTextValue] = useState("")
  const isNewTextRef = useRef(false)

  // Multi-touch passthrough
  const pointerIdsRef = useRef(new Set<number>())
  const [passthroughMode, setPassthroughMode] = useState(false)

  // Marquee selection state
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)
  const isMarqueeRef = useRef(false)

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
    isDrawingRef.current = false
    currentStrokeRef.current = []
    setCurrentStroke(null)
    isMarqueeRef.current = false
    selectionStartRef.current = null
    setSelectionRect(null)
  }, [])

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
      setEditTextValue((obj as TextObject).text)
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

      // TEXT mode: click empty area -> create new text
      if (mode === AnnotationMode.TEXT) {
        const clickedOnEmpty = e.target === stage
        if (clickedOnEmpty) {
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
          setEditTextValue("")
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

      if (mode !== AnnotationMode.PEN || !isDrawingRef.current) return

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

      if (mode !== AnnotationMode.PEN || !isDrawingRef.current) return

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
          strokeWidth: penSize,
          timestamp: Date.now(),
        }
        addObject(freehandObj)
      }

      currentStrokeRef.current = []
      setCurrentStroke(null)
    },
    [mode, selectionRect, bounds.visibleWidth, bounds.visibleHeight, color, penSize, addObject, setSelectedIds],
  )

  // ---------------------------------------------------------------------------
  // Text editing: save / cancel
  // ---------------------------------------------------------------------------

  const saveTextEdit = useCallback(() => {
    if (!editingTextId) return
    const trimmed = editTextValue.trim()

    if (trimmed === "") {
      // Empty text -> remove the object
      removeObject(editingTextId)
    } else {
      updateObject(editingTextId, { text: trimmed } as Partial<TextObject>)
    }

    setEditingTextId(null)
    setEditTextValue("")
    isNewTextRef.current = false
  }, [editingTextId, editTextValue, removeObject, updateObject])

  const cancelTextEdit = useCallback(() => {
    if (!editingTextId) return

    // If it was a new empty text, remove it
    if (isNewTextRef.current) {
      const obj = objects.find((o) => o.id === editingTextId)
      if (obj && obj.type === "text" && (obj as TextObject).text === "") {
        removeObject(editingTextId)
      }
    }

    setEditingTextId(null)
    setEditTextValue("")
    isNewTextRef.current = false
  }, [editingTextId, objects, removeObject])

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

  // ---------------------------------------------------------------------------
  // Determine selected object type for Transformer anchors
  // ---------------------------------------------------------------------------

  const singleSelectedObj = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null
  const selectedObjectType = singleSelectedObj?.type ?? null

  // ---------------------------------------------------------------------------
  // Text editing textarea position calculation
  // ---------------------------------------------------------------------------

  // Force re-render after Konva commit so textarea can find the Text node
  const [, forceUpdate] = useState(0)
  useLayoutEffect(() => {
    if (editingTextId) {
      forceUpdate((c) => c + 1)
    }
  }, [editingTextId])

  const getTextareaStyle = useCallback((): React.CSSProperties => {
    if (!editingTextId || !stageRef.current) {
      return { display: "none" }
    }

    const stageBox = stageRef.current.container().getBoundingClientRect()
    const scaleX = stageBox.width / bounds.visibleWidth
    const obj = objects.find((o) => o.id === editingTextId) as TextObject | undefined

    // Try Konva node first, fallback to object coordinates
    const textNode = stageRef.current.findOne(`#${editingTextId}`) as Konva.Text | null
    let posX: number
    let posY: number
    let nodeWidth = 0
    let nodeHeight = 0

    if (textNode) {
      const textRect = textNode.getClientRect()
      posX = textRect.x
      posY = textRect.y
      nodeWidth = textRect.width
      nodeHeight = textRect.height
    } else if (obj) {
      posX = obj.x * bounds.visibleWidth
      posY = obj.y * bounds.visibleHeight
    } else {
      return { display: "none" }
    }

    return {
      position: "fixed" as const,
      top: stageBox.top + posY * scaleX,
      left: stageBox.left + posX * scaleX,
      width: Math.max(nodeWidth * scaleX + 20, 100),
      minHeight: Math.max(nodeHeight * scaleX + 10, 30),
      fontSize: (obj?.fontSize ?? fontSize) * scaleX,
      fontWeight: obj?.fontWeight ?? fontWeight,
      fontFamily: "sans-serif",
      color: obj?.color ?? color,
      background: "rgba(255,255,255,0.9)",
      border: "2px solid #3B82F6",
      borderRadius: 4,
      outline: "none",
      padding: "2px 4px",
      resize: "none" as const,
      overflow: "hidden",
      zIndex: 10010,
      lineHeight: 1.2,
    }
  }, [editingTextId, bounds.visibleWidth, bounds.visibleHeight, objects, fontSize, fontWeight, color])

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
                  text={obj.text}
                  fontSize={obj.fontSize}
                  fontStyle={obj.fontWeight === "bold" ? "bold" : "normal"}
                  fill={obj.color}
                  width={obj.width ? obj.width * bounds.visibleWidth : undefined}
                  draggable={mode === AnnotationMode.SELECT}
                  onClick={mode === AnnotationMode.SELECT ? handleObjectClick : undefined}
                  onTap={mode === AnnotationMode.SELECT ? handleObjectClick : undefined}
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
              strokeWidth={penSize}
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

      {/* Text editing textarea via Portal */}
      {editingTextId &&
        typeof document !== "undefined" &&
        createPortal(
          <textarea
            autoFocus
            value={editTextValue}
            onChange={(e) => setEditTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                saveTextEdit()
              }
              if (e.key === "Escape") {
                e.preventDefault()
                cancelTextEdit()
              }
            }}
            onBlur={saveTextEdit}
            style={getTextareaStyle()}
          />,
          document.body,
        )}
    </div>
  )
}
