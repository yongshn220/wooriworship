import { useState, useEffect, useRef, useCallback } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Stroke, SheetAnnotation } from "@/models/sheet_annotation"
import SheetAnnotationApi from "@/apis/SheetAnnotationApi"
import { auth } from "@/firebase"

interface UseAnnotationParams {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
}

export function useAnnotation({ teamId, songId, sheetId, pageIndex }: UseAnnotationParams) {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const undoStackRef = useRef<Stroke[][]>([])
  const redoStackRef = useRef<Stroke[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const userId = auth.currentUser?.uid

  const debouncedSave = useDebouncedCallback(
    (strokesToSave: Stroke[]) => {
      if (!userId) return
      setIsSaving(true)
      SheetAnnotationApi.saveAnnotation(teamId, songId, sheetId, pageIndex, userId, {
        strokes: strokesToSave,
        page_index: pageIndex,
      }).finally(() => setIsSaving(false))
    },
    2000
  )

  // Load annotations on mount
  useEffect(() => {
    if (!userId || !songId || !sheetId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    SheetAnnotationApi.getAnnotation(teamId, songId, sheetId, pageIndex, userId)
      .then((data) => {
        if (data?.strokes) {
          setStrokes(data.strokes)
        }
      })
      .finally(() => setIsLoading(false))
  }, [teamId, songId, sheetId, pageIndex, userId])

  // Flush on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush()
    }
  }, [debouncedSave])

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(redoStackRef.current.length > 0)
  }, [])

  const addStroke = useCallback((stroke: Stroke) => {
    setStrokes((prev) => {
      undoStackRef.current.push([...prev])
      redoStackRef.current = []
      const next = [...prev, stroke]
      debouncedSave(next)
      updateUndoRedoState()
      return next
    })
  }, [debouncedSave, updateUndoRedoState])

  const removeStroke = useCallback((strokeId: string) => {
    setStrokes((prev) => {
      undoStackRef.current.push([...prev])
      redoStackRef.current = []
      const next = prev.filter((s) => s.id !== strokeId)
      debouncedSave(next)
      updateUndoRedoState()
      return next
    })
  }, [debouncedSave, updateUndoRedoState])

  const undo = useCallback(() => {
    const prevState = undoStackRef.current.pop()
    if (prevState === undefined) return
    setStrokes((current) => {
      redoStackRef.current.push([...current])
      debouncedSave(prevState)
      updateUndoRedoState()
      return prevState
    })
  }, [debouncedSave, updateUndoRedoState])

  const redo = useCallback(() => {
    const nextState = redoStackRef.current.pop()
    if (nextState === undefined) return
    setStrokes((current) => {
      undoStackRef.current.push([...current])
      debouncedSave(nextState)
      updateUndoRedoState()
      return nextState
    })
  }, [debouncedSave, updateUndoRedoState])

  const clearAll = useCallback(() => {
    if (strokes.length === 0) return
    undoStackRef.current.push([...strokes])
    redoStackRef.current = []
    setStrokes([])
    debouncedSave([])
    updateUndoRedoState()
  }, [strokes, debouncedSave, updateUndoRedoState])

  return {
    strokes,
    addStroke,
    removeStroke,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
  }
}
