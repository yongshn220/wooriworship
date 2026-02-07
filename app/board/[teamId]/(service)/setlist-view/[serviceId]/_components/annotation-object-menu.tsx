"use client"

import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { Trash2, Copy } from "lucide-react"
import {
  selectedAnnotationIdAtom,
  activeAnnotationCanvasAtom,
  annotationModeAtom,
} from "../_states/annotation-states"
import { AnnotationMode, PenColor } from "@/models/sheet_annotation"
import { cn } from "@/lib/utils"

const MENU_COLORS = [
  { value: PenColor.BLACK, bg: "bg-black" },
  { value: PenColor.RED, bg: "bg-red-500" },
  { value: PenColor.BLUE, bg: "bg-blue-500" },
  { value: PenColor.GREEN, bg: "bg-green-500" },
  { value: PenColor.ORANGE, bg: "bg-orange-500" },
  { value: PenColor.PURPLE, bg: "bg-purple-500" },
]

export function AnnotationObjectMenu() {
  const selectedIds = useRecoilValue(selectedAnnotationIdAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const mode = useRecoilValue(annotationModeAtom)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Update position when selection changes
  useEffect(() => {
    if (selectedIds.length === 0 || mode !== AnnotationMode.SELECT) {
      setPosition(null)
      setShowColorPicker(false)
      return
    }

    const updatePosition = () => {
      const bounds = activeCanvas?.getSelectionBounds?.()
      if (!bounds) {
        setPosition(null)
        return
      }
      // Position centered above the selection
      setPosition({
        top: bounds.top - 48, // 48px above selection
        left: bounds.left + bounds.width / 2,
      })
    }

    updatePosition()
    // Poll for position updates while selected (for drag)
    const interval = setInterval(updatePosition, 100)
    return () => clearInterval(interval)
  }, [selectedIds, activeCanvas, mode])

  if (!position || selectedIds.length === 0 || mode !== AnnotationMode.SELECT) {
    return null
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
      {/* Delete */}
      <button
        onClick={() => activeCanvas?.deleteSelected()}
        className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Duplicate */}
      <button
        onClick={() => {
          // Duplicate will be handled by adding a duplicateSelected to callbacks
          // For now, this is a placeholder
        }}
        className="p-2 rounded-md hover:bg-muted transition-colors"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Color */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Color"
        >
          <div className="w-4 h-4 rounded-full bg-foreground border border-border" />
        </button>

        {showColorPicker && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 bg-background rounded-lg shadow-lg border border-border p-1.5">
            {MENU_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  // TODO: Change color of selected objects
                  setShowColorPicker(false)
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:ring-2 ring-offset-1 ring-offset-background ring-foreground/30 transition-all"
              >
                <div className={cn("w-4 h-4 rounded-full", c.bg)} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
