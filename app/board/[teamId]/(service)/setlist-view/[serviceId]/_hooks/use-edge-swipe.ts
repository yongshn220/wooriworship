import { useEffect, useRef } from "react"
import { AnnotationMode } from "@/models/sheet_annotation"

interface UseEdgeSwipeParams {
  wrapperRef: React.RefObject<HTMLDivElement | null>
  annotationMode: AnnotationMode
  onPrevPage: () => void
  onNextPage: () => void
}

const EDGE_THRESHOLD = 20
const MIN_SWIPE_DISTANCE = 50

export function useEdgeSwipe({ wrapperRef, annotationMode, onPrevPage, onNextPage }: UseEdgeSwipeParams) {
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isEdgeSwipeRef = useRef(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const handlePointerDown = (e: PointerEvent) => {
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
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isEdgeSwipeRef.current || !swipeStartRef.current) return

      const deltaX = e.clientX - swipeStartRef.current.x
      const deltaY = e.clientY - swipeStartRef.current.y
      const distance = Math.abs(deltaX)

      if (distance >= MIN_SWIPE_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          onPrevPage()
        } else {
          onNextPage()
        }
      }

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
  }, [wrapperRef, annotationMode, onPrevPage, onNextPage])
}
