"use client"

import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import {
  MousePointer2,
  Pencil,
  Type,
  Bold,
  Undo2,
  Redo2,
  Trash2,
  ChevronDown,
  Eraser,
  ListX,
  Highlighter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
  annotationColorAtom,
  annotationSizeAtom,
  annotationFontSizeAtom,
  annotationFontWeightAtom,
  activeAnnotationCanvasAtom,
} from "../_states/annotation-states"
import { AnnotationMode, PenColor, PenSize, FontSize } from "@/models/sheet_annotation"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAnnotationShortcuts } from "../_hooks/use-annotation-shortcuts"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AnnotationToolbarProps {
  onClose: () => void
  onPrevPage: () => void
  onNextPage: () => void
  currentPage: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = [
  { value: PenColor.BLACK, bg: "bg-black", ring: "ring-black" },
  { value: PenColor.RED, bg: "bg-red-500", ring: "ring-red-500" },
  { value: PenColor.BLUE, bg: "bg-blue-500", ring: "ring-blue-500" },
  { value: PenColor.GREEN, bg: "bg-green-500", ring: "ring-green-500" },
  { value: PenColor.ORANGE, bg: "bg-orange-500", ring: "ring-orange-500" },
  { value: PenColor.PURPLE, bg: "bg-purple-500", ring: "ring-purple-500" },
  { value: PenColor.GRAY, bg: "bg-gray-500", ring: "ring-gray-500" },
  { value: PenColor.WHITE, bg: "bg-white border border-border", ring: "ring-gray-400" },
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

function useIsDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(hasDarkClass || prefersDark)
    }

    checkDarkMode()

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const observer = new MutationObserver(checkDarkMode)

    mediaQuery.addEventListener("change", checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      mediaQuery.removeEventListener("change", checkDarkMode)
      observer.disconnect()
    }
  }, [])

  return isDarkMode
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
  { mode: AnnotationMode.SELECT, Icon: MousePointer2, label: "Select" },
  { mode: AnnotationMode.PEN, Icon: Pencil, label: "Pen" },
  { mode: AnnotationMode.HIGHLIGHTER, Icon: Highlighter, label: "Highlight" },
  { mode: AnnotationMode.ERASER, Icon: Eraser, label: "Eraser" },
  { mode: AnnotationMode.TEXT, Icon: Type, label: "Text" },
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
            "p-2 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center",
            mode === m
              ? "bg-foreground text-background"
              : "text-foreground/70 hover:bg-muted"
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
            "w-7 h-7 rounded-full flex-center",
            color === c.value && "ring-2 ring-offset-2 ring-offset-background"
          )}
        >
          <div className={cn("w-3.5 h-3.5 rounded-full", c.bg)} />
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
      <PopoverContent side="bottom" className="w-auto p-2 rounded-xl z-50" sideOffset={8}>
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
            "w-7 h-7 rounded-full flex-center",
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
      <PopoverContent side="bottom" className="w-auto p-2 rounded-xl z-50" sideOffset={8}>
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
      <PopoverContent side="bottom" className="w-auto p-2 rounded-xl z-50" sideOffset={8}>
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
        "p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
        fontWeight === "bold"
          ? "bg-foreground text-background"
          : "text-foreground/70 hover:bg-muted"
      )}
    >
      <Bold className="w-3.5 h-3.5" />
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
      className="p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-red-500 hover:bg-red-500/10"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Settings Row Content
// ---------------------------------------------------------------------------

function SettingsRowContent({
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
    return <DeleteButton onDelete={onDeleteSelected} />
  }

  if (mode === AnnotationMode.PEN || mode === AnnotationMode.HIGHLIGHTER) {
    return (
      <>
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

export function AnnotationToolbar({
  onClose,
  onPrevPage,
  onNextPage,
  currentPage,
  totalPages,
}: AnnotationToolbarProps) {
  const drawingMode = useRecoilValue(annotationDrawingModeAtom)
  const [mode, setMode] = useRecoilState(annotationModeAtom)
  const [color, setColor] = useRecoilState(annotationColorAtom)
  const [size, setSize] = useRecoilState(annotationSizeAtom)
  const [fontSize, setFontSize] = useRecoilState(annotationFontSizeAtom)
  const [fontWeight, setFontWeight] = useRecoilState(annotationFontWeightAtom)
  const activeCanvas = useRecoilValue(activeAnnotationCanvasAtom)
  const isCompact = useIsCompact()
  const isDarkMode = useIsDarkMode()

  useAnnotationShortcuts()

  useEffect(() => {
    if (drawingMode && isDarkMode && color === PenColor.BLACK) {
      setColor(PenColor.WHITE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only fire on mode/theme change, not color
  }, [drawingMode, isDarkMode])

  if (!drawingMode) return null

  const showSettings =
    mode === AnnotationMode.PEN ||
    mode === AnnotationMode.HIGHLIGHTER ||
    mode === AnnotationMode.TEXT ||
    (mode === AnnotationMode.SELECT && (activeCanvas?.hasSelection ?? false))

  return (
    <div className="border-b border-border bg-background">
      {/* Main toolbar row */}
      <div className="flex items-center h-11 px-2 gap-1">
        {/* Left zone: Close + Undo/Redo + Clear All */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <Divider />

        <button
          onClick={() => activeCanvas?.undo()}
          disabled={!activeCanvas?.canUndo}
          className={cn(
            "p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
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
            "p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
            activeCanvas?.canRedo
              ? "text-foreground hover:bg-muted"
              : "text-foreground/20 cursor-default"
          )}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Clear all with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={!activeCanvas || !activeCanvas.canClear}
              className={cn(
                "p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
                (activeCanvas && activeCanvas.canClear)
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-foreground/20 cursor-default"
              )}
            >
              <ListX className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모든 주석을 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                이 페이지의 모든 주석이 삭제됩니다. 에디터를 닫은 후에는 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => activeCanvas?.clearAll()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                모두 삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Divider />

        {/* Center zone: Tool buttons */}
        <div className="flex items-center gap-0.5 flex-1 justify-center">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        <Divider />

        {/* Right zone: Pagination + Save status */}
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium tabular-nums min-w-[36px] text-center text-muted-foreground">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-7 flex items-center justify-center">
          {activeCanvas?.isSaving && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {activeCanvas && !activeCanvas.isSaving && activeCanvas.saveError && (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          {activeCanvas && !activeCanvas.isSaving && !activeCanvas.saveError && (
            <Check className="w-4 h-4 text-muted-foreground/50" />
          )}
        </div>
      </div>

      {/* Contextual settings row - slides in/out */}
      {showSettings && (
        <div className="flex items-center justify-center h-10 px-2 gap-1 border-t border-border/50">
          <SettingsRowContent
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
        </div>
      )}
    </div>
  )
}
