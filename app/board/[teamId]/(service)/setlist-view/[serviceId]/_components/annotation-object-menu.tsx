"use client"

import { useRecoilValue } from "recoil"
import { Trash2 } from "lucide-react"
import {
  selectedAnnotationIdAtom,
  activeAnnotationCanvasAtom,
  annotationModeAtom,
  annotationSelectionBoundsAtom,
} from "../_states/annotation-states"
import { AnnotationMode } from "@/models/sheet_annotation"

export function AnnotationObjectMenu() {
  const selectedIds = useRecoilValue(selectedAnnotationIdAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const mode = useRecoilValue(annotationModeAtom)
  const selectionBounds = useRecoilValue(annotationSelectionBoundsAtom)

  if (!selectionBounds || selectedIds.length === 0 || mode !== AnnotationMode.SELECT) {
    return null
  }

  const position = {
    top: selectionBounds.top - 48,
    left: selectionBounds.left + selectionBounds.width / 2,
  }

  // Clamp position to viewport
  const clampedTop = Math.max(8, position.top)
  const clampedLeft = Math.max(80, Math.min(window.innerWidth - 80, position.left))

  return (
    <div
      className="fixed z-50 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-1 -translate-x-1/2"
      style={{
        top: clampedTop,
        left: clampedLeft,
      }}
    >
      <button
        onClick={() => activeCanvas?.deleteSelected()}
        className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
