import { useState, useEffect, useRef, useCallback } from "react"
import { useDebouncedCallback } from "use-debounce"
import { AnnotationObject, SheetAnnotation } from "@/models/sheet_annotation"
import SheetAnnotationApi from "@/apis/SheetAnnotationApi"
import { auth } from "@/firebase"

// Module-level undo stack cache (survives React remounts)
const undoStackCache = new Map<string, AnnotationObject[][]>()
const redoStackCache = new Map<string, AnnotationObject[][]>()
const MAX_STACK_SIZE = 50

export function clearUndoStackCache() {
  undoStackCache.clear()
  redoStackCache.clear()
}

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
  const cacheKey = `${sheetId}_${pageIndex}`

  // Restore stacks from cache on mount
  useEffect(() => {
    const cachedUndo = undoStackCache.get(cacheKey)
    const cachedRedo = redoStackCache.get(cacheKey)

    if (cachedUndo) {
      undoStackRef.current = cachedUndo.map(stack => [...stack])
    }
    if (cachedRedo) {
      redoStackRef.current = cachedRedo.map(stack => [...stack])
    }

    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(redoStackRef.current.length > 0)
  }, [cacheKey])

  // Save stacks to cache on unmount
  useEffect(() => {
    return () => {
      undoStackCache.set(cacheKey, undoStackRef.current.map(stack => [...stack]))
      redoStackCache.set(cacheKey, redoStackRef.current.map(stack => [...stack]))
    }
  }, [cacheKey])

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

  const saveToCache = useCallback(() => {
    // Cap at MAX_STACK_SIZE entries
    const undoToCache = undoStackRef.current.slice(-MAX_STACK_SIZE).map(stack => [...stack])
    const redoToCache = redoStackRef.current.slice(-MAX_STACK_SIZE).map(stack => [...stack])

    undoStackCache.set(cacheKey, undoToCache)
    redoStackCache.set(cacheKey, redoToCache)
  }, [cacheKey])

  const addObject = useCallback((object: AnnotationObject) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      if (undoStackRef.current.length > MAX_STACK_SIZE) {
        undoStackRef.current.shift()
      }
      redoStackRef.current = []
      const next = [...prev, object]
      debouncedSave(next)
      updateUndoRedoState()
      saveToCache()
      return next
    })
  }, [debouncedSave, updateUndoRedoState, saveToCache])

  const removeObject = useCallback((objectId: string) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      if (undoStackRef.current.length > MAX_STACK_SIZE) {
        undoStackRef.current.shift()
      }
      redoStackRef.current = []
      const next = prev.filter((obj) => obj.id !== objectId)
      debouncedSave(next)
      updateUndoRedoState()
      saveToCache()
      return next
    })
  }, [debouncedSave, updateUndoRedoState, saveToCache])

  const updateObject = useCallback((id: string, updates: Partial<AnnotationObject>) => {
    setObjects((prev) => {
      undoStackRef.current.push([...prev])
      if (undoStackRef.current.length > MAX_STACK_SIZE) {
        undoStackRef.current.shift()
      }
      redoStackRef.current = []
      const next = prev.map((obj) =>
        obj.id === id ? { ...obj, ...updates } as AnnotationObject : obj
      )
      debouncedSave(next)
      updateUndoRedoState()
      saveToCache()
      return next
    })
  }, [debouncedSave, updateUndoRedoState, saveToCache])

  const undo = useCallback(() => {
    const prevState = undoStackRef.current.pop()
    if (prevState === undefined) return
    setObjects((current) => {
      redoStackRef.current.push([...current])
      if (redoStackRef.current.length > MAX_STACK_SIZE) {
        redoStackRef.current.shift()
      }
      debouncedSave(prevState)
      updateUndoRedoState()
      saveToCache()
      return prevState
    })
  }, [debouncedSave, updateUndoRedoState, saveToCache])

  const redo = useCallback(() => {
    const nextState = redoStackRef.current.pop()
    if (nextState === undefined) return
    setObjects((current) => {
      undoStackRef.current.push([...current])
      if (undoStackRef.current.length > MAX_STACK_SIZE) {
        undoStackRef.current.shift()
      }
      debouncedSave(nextState)
      updateUndoRedoState()
      saveToCache()
      return nextState
    })
  }, [debouncedSave, updateUndoRedoState, saveToCache])

  const clearAll = useCallback(() => {
    if (objects.length === 0) return
    undoStackRef.current.push([...objects])
    if (undoStackRef.current.length > MAX_STACK_SIZE) {
      undoStackRef.current.shift()
    }
    redoStackRef.current = []
    setObjects([])
    debouncedSave([])
    updateUndoRedoState()
    saveToCache()
  }, [objects, debouncedSave, updateUndoRedoState, saveToCache])

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
