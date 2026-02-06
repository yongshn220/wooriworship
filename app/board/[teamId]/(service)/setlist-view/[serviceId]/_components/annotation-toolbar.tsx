"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { MousePointer2, Pencil, Type, Bold, Undo2, Redo2, Trash2, X, ChevronDown } from "lucide-react"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationColorAtom,
  annotationSizeAtom,
  annotationFontSizeAtom,
  annotationFontWeightAtom,
  activeAnnotationCanvasAtom,
  annotationEditorTargetAtom,
} from "../_states/annotation-states"
import { AnnotationMode, PenColor, PenSize, FontSize } from "@/models/sheet_annotation"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAnnotationShortcuts } from "../_hooks/use-annotation-shortcuts"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = [
  { value: PenColor.BLACK, bg: "bg-black", ring: "ring-black" },
  { value: PenColor.RED, bg: "bg-red-500", ring: "ring-red-500" },
  { value: PenColor.BLUE, bg: "bg-blue-500", ring: "ring-blue-500" },
]

const SIZES = [
  { value: PenSize.THIN, dotClass: "w-1.5 h-1.5", lineClass: "w-3 h-[2px]" },
  { value: PenSize.MEDIUM, dotClass: "w-2.5 h-2.5", lineClass: "w-3.5 h-[3px]" },
  { value: PenSize.THICK, dotClass: "w-3.5 h-3.5", lineClass: "w-4 h-[5px]" },
]

const FONT_SIZES = [
  { value: FontSize.SMALL, label: "14" },
  { value: FontSize.MEDIUM, label: "18" },
  { value: FontSize.LARGE, label: "24" },
  { value: FontSize.XLARGE, label: "32" },
]

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useIsCompact(breakpoint: number = 420) {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const check = () => setIsCompact(window.innerWidth < breakpoint)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])

  return isCompact
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

function Divider() {
  return <div className="w-px h-6 bg-border mx-0.5" />
}

// ---------------------------------------------------------------------------
// Mode Toggle
// ---------------------------------------------------------------------------

const MODES = [
  { mode: AnnotationMode.SELECT, Icon: MousePointer2, label: "Select", compactLabel: "Sel" },
  { mode: AnnotationMode.PEN, Icon: Pencil, label: "Pen", compactLabel: "Pen" },
  { mode: AnnotationMode.TEXT, Icon: Type, label: "Text", compactLabel: "Txt" },
] as const

function ModeToggle({
  mode,
  setMode,
}: {
  mode: AnnotationMode
  setMode: (m: AnnotationMode) => void
}) {
  return (
    <>
      {MODES.map(({ mode: m, Icon }) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            "p-2 rounded-full transition-colors",
            mode === m
              ? "bg-foreground text-background"
              : "text-foreground hover:bg-muted"
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Color Pickers (string-typed)
// ---------------------------------------------------------------------------

function ColorPickerInline({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  return (
    <>
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
    </>
  )
}

function ColorPickerCompact({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const currentColor = COLORS.find((c) => c.value === color)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-8 h-8 rounded-full flex-center gap-0.5 hover:bg-muted transition-colors">
          <div className={cn("w-4 h-4 rounded-full", currentColor?.bg)} />
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto p-2 rounded-xl z-[10003]" sideOffset={8}>
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => { setColor(c.value); setOpen(false) }}
              className={cn(
                "w-8 h-8 rounded-full flex-center",
                color === c.value && "ring-2 ring-offset-2 ring-offset-background"
              )}
            >
              <div className={cn("w-5 h-5 rounded-full", c.bg)} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Size Pickers
// ---------------------------------------------------------------------------

function SizePickerInline({ size, setSize }: { size: PenSize; setSize: (s: PenSize) => void }) {
  return (
    <>
      {SIZES.map((s) => (
        <button
          key={s.value}
          onClick={() => setSize(s.value)}
          className={cn(
            "w-6 h-6 rounded-full flex-center",
            size === s.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
          )}
        >
          <div className={cn("rounded-full bg-foreground", s.dotClass)} />
        </button>
      ))}
    </>
  )
}

function SizePickerCompact({ size, setSize }: { size: PenSize; setSize: (s: PenSize) => void }) {
  const [open, setOpen] = useState(false)
  const currentSize = SIZES.find((s) => s.value === size)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-8 h-8 rounded-full flex-center gap-0.5 hover:bg-muted transition-colors">
          <div className={cn("rounded-sm bg-foreground", currentSize?.lineClass)} />
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto p-2 rounded-xl z-[10003]" sideOffset={8}>
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setSize(s.value); setOpen(false) }}
              className={cn(
                "w-8 h-8 rounded-full flex-center",
                size === s.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
              )}
            >
              <div className={cn("rounded-sm bg-foreground", s.lineClass)} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Font Size Pickers
// ---------------------------------------------------------------------------

function FontSizePickerInline({
  fontSize,
  setFontSize,
}: {
  fontSize: number
  setFontSize: (s: number) => void
}) {
  return (
    <>
      {FONT_SIZES.map((f) => (
        <button
          key={f.value}
          onClick={() => setFontSize(f.value)}
          className={cn(
            "h-7 min-w-[28px] px-1 rounded-md text-xs font-medium transition-colors",
            fontSize === f.value
              ? "bg-foreground text-background"
              : "text-foreground hover:bg-muted"
          )}
        >
          {f.label}
        </button>
      ))}
    </>
  )
}

function FontSizePickerCompact({
  fontSize,
  setFontSize,
}: {
  fontSize: number
  setFontSize: (s: number) => void
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = FONT_SIZES.find((f) => f.value === fontSize)?.label ?? "18"

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="h-8 px-1.5 rounded-full flex items-center gap-0.5 hover:bg-muted transition-colors text-xs font-medium">
          {currentLabel}
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto p-2 rounded-xl z-[10003]" sideOffset={8}>
        <div className="flex items-center gap-1">
          {FONT_SIZES.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFontSize(f.value); setOpen(false) }}
              className={cn(
                "h-8 min-w-[32px] px-1.5 rounded-md text-sm font-medium transition-colors",
                fontSize === f.value
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Bold Toggle
// ---------------------------------------------------------------------------

function BoldToggle({
  fontWeight,
  setFontWeight,
}: {
  fontWeight: "normal" | "bold"
  setFontWeight: (w: "normal" | "bold") => void
}) {
  return (
    <button
      onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
      className={cn(
        "p-2 rounded-full transition-colors",
        fontWeight === "bold"
          ? "bg-foreground text-background"
          : "text-foreground hover:bg-muted"
      )}
    >
      <Bold className="w-4 h-4" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Delete Button (SELECT mode only, when selection exists)
// ---------------------------------------------------------------------------

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={onDelete}
      className="p-2 rounded-full transition-colors text-red-500 hover:bg-red-500/10"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Contextual Controls
// ---------------------------------------------------------------------------

function ContextualControls({
  mode,
  isCompact,
  color,
  setColor,
  size,
  setSize,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight,
  hasSelection,
  onDeleteSelected,
}: {
  mode: AnnotationMode
  isCompact: boolean
  color: string
  setColor: (c: string) => void
  size: PenSize
  setSize: (s: PenSize) => void
  fontSize: number
  setFontSize: (s: number) => void
  fontWeight: "normal" | "bold"
  setFontWeight: (w: "normal" | "bold") => void
  hasSelection: boolean
  onDeleteSelected: () => void
}) {
  if (mode === AnnotationMode.SELECT) {
    if (!hasSelection) return null
    return (
      <>
        <Divider />
        <DeleteButton onDelete={onDeleteSelected} />
      </>
    )
  }

  if (mode === AnnotationMode.PEN) {
    return (
      <>
        <Divider />
        {isCompact ? (
          <>
            <ColorPickerCompact color={color} setColor={setColor} />
            <SizePickerCompact size={size} setSize={setSize} />
          </>
        ) : (
          <>
            <ColorPickerInline color={color} setColor={setColor} />
            <Divider />
            <SizePickerInline size={size} setSize={setSize} />
          </>
        )}
      </>
    )
  }

  if (mode === AnnotationMode.TEXT) {
    return (
      <>
        <Divider />
        {isCompact ? (
          <>
            <ColorPickerCompact color={color} setColor={setColor} />
            <FontSizePickerCompact fontSize={fontSize} setFontSize={setFontSize} />
            <BoldToggle fontWeight={fontWeight} setFontWeight={setFontWeight} />
          </>
        ) : (
          <>
            <ColorPickerInline color={color} setColor={setColor} />
            <Divider />
            <FontSizePickerInline fontSize={fontSize} setFontSize={setFontSize} />
            <Divider />
            <BoldToggle fontWeight={fontWeight} setFontWeight={setFontWeight} />
          </>
        )}
      </>
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// Main Toolbar
// ---------------------------------------------------------------------------

export function AnnotationToolbar() {
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const [mode, setMode] = useRecoilState(annotationModeAtom)
  const [color, setColor] = useRecoilState(annotationColorAtom)
  const [size, setSize] = useRecoilState(annotationSizeAtom)
  const [fontSize, setFontSize] = useRecoilState(annotationFontSizeAtom)
  const [fontWeight, setFontWeight] = useRecoilState(annotationFontWeightAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const setEditorTarget = useSetRecoilState(annotationEditorTargetAtom)
  const isCompact = useIsCompact()
  useAnnotationShortcuts()

  const handleClose = () => {
    setEditorTarget(null)
  }

  return (
    <AnimatePresence>
      {drawingMode && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-8 left-0 w-full z-[10002] flex justify-center pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-background shadow-lg border border-border p-1">
            {/* Close (exit editor) */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full transition-colors text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <Divider />

            {/* Mode toggle: Select / Pen / Text */}
            <ModeToggle mode={mode} setMode={setMode} />

            {/* Contextual controls per mode */}
            <ContextualControls
              mode={mode}
              isCompact={isCompact}
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontWeight={fontWeight}
              setFontWeight={setFontWeight}
              hasSelection={activeCanvas?.hasSelection ?? false}
              onDeleteSelected={() => activeCanvas?.deleteSelected()}
            />

            <Divider />

            {/* Undo / Redo */}
            <button
              onClick={() => activeCanvas?.undo()}
              disabled={!activeCanvas?.canUndo}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canUndo
                  ? "text-foreground hover:bg-muted"
                  : "text-foreground/20 cursor-default"
              )}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => activeCanvas?.redo()}
              disabled={!activeCanvas?.canRedo}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canRedo
                  ? "text-foreground hover:bg-muted"
                  : "text-foreground/20 cursor-default"
              )}
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <Divider />

            {/* Clear all */}
            <button
              onClick={() => activeCanvas?.clearAll()}
              disabled={!activeCanvas?.canClear}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeCanvas?.canClear
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-foreground/20 cursor-default"
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
