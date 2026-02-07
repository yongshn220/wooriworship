"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRecoilState, useRecoilValue } from "recoil"
import { Pencil, Eraser, Undo2, Redo2, Trash2 } from "lucide-react"
import { annotationDrawingModeAtom, annotationToolAtom, annotationColorAtom, annotationSizeAtom, activeAnnotationCanvasAtom } from "../_states/annotation-states"
import { DrawingTool, PenColor, PenSize } from "@/models/sheet_annotation"
import { cn } from "@/lib/utils"

const COLORS = [
  { value: PenColor.BLACK, bg: "bg-black", ring: "ring-black" },
  { value: PenColor.RED, bg: "bg-red-500", ring: "ring-red-500" },
  { value: PenColor.BLUE, bg: "bg-blue-500", ring: "ring-blue-500" },
]

const SIZES = [
  { value: PenSize.THIN, className: "w-1.5 h-1.5" },
  { value: PenSize.MEDIUM, className: "w-2.5 h-2.5" },
  { value: PenSize.THICK, className: "w-3.5 h-3.5" },
]

export function AnnotationToolbar() {
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const [tool, setTool] = useRecoilState(annotationToolAtom)
  const [color, setColor] = useRecoilState(annotationColorAtom)
  const [size, setSize] = useRecoilState(annotationSizeAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)

  return (
    <AnimatePresence>
      {drawingMode && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 w-full z-[10001] flex justify-center pointer-events-none bottom-[calc(5rem+env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-background shadow-lg border border-border p-1">
            {/* Tool toggle */}
            <button
              onClick={() => setTool(DrawingTool.PEN)}
              className={cn(
                "p-2 rounded-full transition-colors",
                tool === DrawingTool.PEN ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              )}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool(DrawingTool.ERASER)}
              className={cn(
                "p-2 rounded-full transition-colors",
                tool === DrawingTool.ERASER ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              )}
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Color picker */}
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-6 h-6 rounded-full flex-center",
                  color === c.value && "ring-2 ring-offset-2 ring-offset-background"
                )}
              >
                <div className={cn("w-4 h-4 rounded-full", c.bg)} />
              </button>
            ))}

            <div className="w-px h-6 bg-border mx-1" />

            {/* Size picker */}
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={cn(
                  "w-6 h-6 rounded-full flex-center",
                  size === s.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                )}
              >
                <div className={cn("rounded-full bg-foreground", s.className)} />
              </button>
            ))}

            <div className="w-px h-6 bg-border mx-1" />

            {/* Undo/Redo */}
            <button
              onClick={() => activeCanvas?.undo()}
              disabled={!activeCanvas?.canUndo}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canUndo ? "text-foreground hover:bg-muted" : "text-foreground/30"
              )}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => activeCanvas?.redo()}
              disabled={!activeCanvas?.canRedo}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canRedo ? "text-foreground hover:bg-muted" : "text-foreground/30"
              )}
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Clear all */}
            <button
              onClick={() => activeCanvas?.clearAll()}
              disabled={!activeCanvas?.canClear}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canClear ? "text-red-500 hover:bg-red-500/10" : "text-foreground/30"
              )}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
