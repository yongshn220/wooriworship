import { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { annotationDrawingModeAtom, activeAnnotationCanvasAtom, annotationEditorTargetAtom } from "../_states/annotation-states"

export function useAnnotationShortcuts() {
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const setEditorTarget = useSetRecoilState(annotationEditorTargetAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)

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

      // Escape: close editor
      if (e.key === "Escape") {
        e.preventDefault()
        setEditorTarget(null)
      }

      // Delete: delete selected
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        activeCanvas?.deleteSelected()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [drawingMode, activeCanvas, setEditorTarget])
}
