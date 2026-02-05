import { RefObject, useCallback, useRef, useState } from "react"
import { Stroke, StrokePoint } from "@/models/sheet_annotation"
import { toSvgPoint } from "../_utils/stroke-utils"

interface UseDrawingInteractionParams {
  svgRef: RefObject<SVGSVGElement | null>
  color: string
  size: number
  onStrokeComplete: (stroke: Stroke) => void
}

export function useDrawingInteraction({ svgRef, color, size, onStrokeComplete }: UseDrawingInteractionParams) {
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const isDrawingRef = useRef(false)
  const pointsRef = useRef<StrokePoint[]>([])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const pressure = e.pressure > 0 ? e.pressure : 0.5
    const point = toSvgPoint(e.clientX, e.clientY, rect, pressure)

    isDrawingRef.current = true
    pointsRef.current = [point]

    setCurrentStroke({
      id: crypto.randomUUID(),
      points: [point],
      color,
      size,
      timestamp: Date.now(),
    })
  }, [svgRef, color, size])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return
    e.stopPropagation()
    e.preventDefault()

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const pressure = e.pressure > 0 ? e.pressure : 0.5
    const point = toSvgPoint(e.clientX, e.clientY, rect, pressure)

    pointsRef.current.push(point)

    setCurrentStroke((prev) => {
      if (!prev) return null
      return {
        ...prev,
        points: [...pointsRef.current],
      }
    })
  }, [svgRef])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return
    e.stopPropagation()
    ;(e.target as Element).releasePointerCapture(e.pointerId)

    isDrawingRef.current = false

    if (pointsRef.current.length > 0) {
      const completedStroke: Stroke = {
        id: crypto.randomUUID(),
        points: [...pointsRef.current],
        color,
        size,
        timestamp: Date.now(),
      }
      onStrokeComplete(completedStroke)
    }

    pointsRef.current = []
    setCurrentStroke(null)
  }, [color, size, onStrokeComplete])

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (isDrawingRef.current) {
      handlePointerUp(e)
    }
  }, [handlePointerUp])

  return {
    currentStroke,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  }
}
