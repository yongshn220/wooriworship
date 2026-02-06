import { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { annotationDrawingModeAtom, activeAnnotationCanvasAtom, annotationEditorTargetAtom, annotationModeAtom, selectedAnnotationIdAtom } from "../_states/annotation-states"
import { AnnotationMode } from "@/models/sheet_annotation"

export function useAnnotationShortcuts() {
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const setEditorTarget = useSetRecoilState(annotationEditorTargetAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const mode = useRecoilValue(annotationModeAtom)
  const setMode = useSetRecoilState(annotationModeAtom)
  const setSelectedIds = useSetRecoilState(selectedAnnotationIdAtom)

  useEffect(() => {
    if (!drawingMode) return

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in textarea/input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "TEXTAREA" || tag === "INPUT") return

      const isMod = e.metaKey || e.ctrlKey

      // Undo: Ctrl/Cmd + Z
      if (isMod && !e.shiftKey && e.key === "z") {
        e.preventDefault()
        activeCanvas?.undo()
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((isMod && e.shiftKey && (e.key === "z" || e.key === "Z")) || (isMod && e.key === "y")) {
        e.preventDefault()
        activeCanvas?.redo()
      }

      // Escape: progressive dismissal
      if (e.key === "Escape") {
        e.preventDefault()
        // 1. If selection exists, deselect first
        if (activeCanvas?.hasSelection) {
          setSelectedIds([])
          return
        }
        // 2. If not in SELECT mode, switch to SELECT
        if (mode !== AnnotationMode.SELECT) {
          setMode(AnnotationMode.SELECT)
          return
        }
        // 3. Otherwise close editor
        setEditorTarget(null)
      }

      // Delete: delete selected (only when selection exists)
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!activeCanvas?.hasSelection) return
        e.preventDefault()
        activeCanvas?.deleteSelected()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [drawingMode, activeCanvas, setEditorTarget, mode, setMode, setSelectedIds])
}
