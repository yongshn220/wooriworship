import { useState, useEffect, useRef, useCallback } from "react"
import { useDebouncedCallback } from "use-debounce"
import { AnnotationObject, SheetAnnotation } from "@/models/sheet_annotation"
import SheetAnnotationApi from "@/apis/SheetAnnotationApi"
import { auth } from "@/firebase"

interface UseAnnotationParams {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
}

export function useAnnotation({ teamId, songId, sheetId, pageIndex }: UseAnnotationParams) {
  const [objects, setObjects] = useState<AnnotationObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const undoStackRef = useRef<AnnotationObject[][]>([])
  const redoStackRef = useRef<AnnotationObject[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const userId = auth.currentUser?.uid

  const debouncedSave = useDebouncedCallback(
    (objectsToSave: AnnotationObject[]) => {
      if (!userId) return
      setIsSaving(true)
      SheetAnnotationApi.saveAnnotation(teamId, songId, sheetId, pageIndex, userId, {
        objects: objectsToSave,
        page_index: pageIndex,
      })
        .then(() => {
          setIsSaving(false)
          setSaveError(null)
        })
        .catch((e) => {
          setIsSaving(false)
          setSaveError(e instanceof Error ? e.message : "Save failed")
        })
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
        if (data?.objects) {
          setObjects(data.objects)
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

  const addObject = useCallback((object: AnnotationObject) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      redoStackRef.current = []
      const next = [...prev, object]
      debouncedSave(next)
      updateUndoRedoState()
      return next
    })
  }, [debouncedSave, updateUndoRedoState])

  const removeObject = useCallback((objectId: string) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      redoStackRef.current = []
      const next = prev.filter((obj) => obj.id !== objectId)
      debouncedSave(next)
      updateUndoRedoState()
      return next
    })
  }, [debouncedSave, updateUndoRedoState])

  const updateObject = useCallback((id: string, updates: Partial<AnnotationObject>) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      redoStackRef.current = []
      const next = prev.map((obj) =>
        obj.id === id ? { ...obj, ...updates } as AnnotationObject : obj
      )
      debouncedSave(next)
      updateUndoRedoState()
      return next
    })
  }, [debouncedSave, updateUndoRedoState])

  const undo = useCallback(() => {
    const prevState = undoStackRef.current.pop()
    if (prevState === undefined) return
    setObjects((current) => {
      redoStackRef.current.push([...current])
      debouncedSave(prevState)
      updateUndoRedoState()
      return prevState
    })
  }, [debouncedSave, updateUndoRedoState])

  const redo = useCallback(() => {
    const nextState = redoStackRef.current.pop()
    if (nextState === undefined) return
    setObjects((current) => {
      undoStackRef.current.push([...current])
      debouncedSave(nextState)
      updateUndoRedoState()
      return nextState
    })
  }, [debouncedSave, updateUndoRedoState])

  const clearAll = useCallback(() => {
    if (objects.length === 0) return
    undoStackRef.current.push([...objects])
    redoStackRef.current = []
    setObjects([])
    debouncedSave([])
    updateUndoRedoState()
  }, [objects, debouncedSave, updateUndoRedoState])

  return {
    objects,
    addObject,
    removeObject,
    updateObject,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
    saveError,
  }
}
