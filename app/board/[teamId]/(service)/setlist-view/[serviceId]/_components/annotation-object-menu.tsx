"use client"

import { useRecoilValue } from "recoil"
import { Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  selectedAnnotationIdAtom,
  activeAnnotationCanvasAtom,
  annotationModeAtom,
  annotationSelectionBoundsAtom,
} from "../_states/annotation-states"
import { AnnotationMode } from "@/models/sheet_annotation"

const SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 30 }

export function AnnotationObjectMenu() {
  const selectedIds = useRecoilValue(selectedAnnotationIdAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const mode = useRecoilValue(annotationModeAtom)
  const selectionBounds = useRecoilValue(annotationSelectionBoundsAtom)

  const isVisible = selectionBounds && selectedIds.length > 0 && mode === AnnotationMode.SELECT

  return (
    <AnimatePresence>
      {isVisible && selectionBounds && (
        <AnnotationObjectMenuContent
          selectionBounds={selectionBounds}
          onDelete={() => activeCanvas?.deleteSelected()}
        />
      )}
    </AnimatePresence>
  )
}

function AnnotationObjectMenuContent({
  selectionBounds,
  onDelete,
}: {
  selectionBounds: { top: number; left: number; width: number }
  onDelete: () => void
}) {
  const position = {
    top: selectionBounds.top - 52,
    left: selectionBounds.left + selectionBounds.width / 2,
  }

  // Clamp position to viewport
  const clampedTop = Math.max(8, position.top)
  const clampedLeft = Math.max(80, Math.min(window.innerWidth - 80, position.left))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 6 }}
      transition={SPRING_SNAPPY}
      className="fixed z-50 flex items-center gap-1 bg-background/70 dark:bg-neutral-900/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-white/15 dark:border-white/10 p-1.5 -translate-x-1/2"
      style={{
        top: clampedTop,
        left: clampedLeft,
      }}
    >
      <motion.button
        onClick={onDelete}
        className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
        title="Delete"
        whileTap={{ scale: 0.85 }}
        transition={SPRING_SNAPPY}
      >
        <Trash2 className="w-[18px] h-[18px]" />
      </motion.button>
    </motion.div>
  )
}
