"use client"

import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { AnimatePresence, motion } from "framer-motion"
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
  { value: PenColor.BLACK, bg: "bg-black", ring: "ring-black", hex: "#000000" },
  { value: PenColor.RED, bg: "bg-red-500", ring: "ring-red-500", hex: "#EF4444" },
  { value: PenColor.BLUE, bg: "bg-blue-500", ring: "ring-blue-500", hex: "#3B82F6" },
  { value: PenColor.GREEN, bg: "bg-green-500", ring: "ring-green-500", hex: "#22C55E" },
  { value: PenColor.ORANGE, bg: "bg-orange-500", ring: "ring-orange-500", hex: "#F97316" },
  { value: PenColor.PURPLE, bg: "bg-purple-500", ring: "ring-purple-500", hex: "#A855F7" },
  { value: PenColor.GRAY, bg: "bg-gray-500", ring: "ring-gray-500", hex: "#6B7280" },
  { value: PenColor.WHITE, bg: "bg-white border border-border", ring: "ring-gray-400", hex: "#FFFFFF" },
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

// Spring config for snappy iOS-feel animations
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 30 }
const SPRING_GENTLE = { type: "spring" as const, stiffness: 300, damping: 25 }

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useIsCompact(breakpoint: number = 420) {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    setIsCompact(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
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
// Glass Divider
// ---------------------------------------------------------------------------

function GlassDivider() {
  return <div className="w-px h-5 bg-foreground/10 mx-0.5" />
}

// ---------------------------------------------------------------------------
// Mode Toggle (Segmented Control with sliding indicator)
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
    <div className="flex items-center gap-0.5 bg-foreground/[0.04] dark:bg-white/[0.06] rounded-xl p-0.5 relative">
      {MODES.map(({ mode: m, Icon }) => (
        <motion.button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            "relative p-2 rounded-[10px] min-w-[38px] min-h-[38px] flex items-center justify-center z-[1] transition-colors duration-200",
            mode === m
              ? "text-foreground"
              : "text-foreground/50 hover:text-foreground/70"
          )}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_SNAPPY}
        >
          {mode === m && (
            <motion.div
              layoutId="annotation-mode-indicator"
              className="absolute inset-0 bg-background dark:bg-white/15 rounded-[10px] shadow-sm"
              transition={SPRING_SNAPPY}
            />
          )}
          <Icon className="w-[18px] h-[18px] relative z-[1]" />
        </motion.button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Color Pickers (string-typed)
// ---------------------------------------------------------------------------

function ColorPickerInline({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  return (
    <>
      {COLORS.map((c) => {
        const isActive = color === c.value
        return (
          <motion.button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={cn(
              "w-8 h-8 rounded-full flex-center relative",
              isActive && "ring-2 ring-offset-2 ring-offset-background"
            )}
            style={isActive ? {
              boxShadow: c.value !== PenColor.BLACK && c.value !== PenColor.WHITE
                ? `0 0 10px ${c.hex}50, 0 0 4px ${c.hex}30`
                : undefined,
              ["--tw-ring-color" as any]: c.hex,
            } : undefined}
            whileTap={{ scale: 0.85 }}
            transition={SPRING_SNAPPY}
          >
            <div className={cn("w-4 h-4 rounded-full", c.bg)} />
          </motion.button>
        )
      })}
    </>
  )
}

function ColorPickerCompact({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const currentColor = COLORS.find((c) => c.value === color)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className="w-8 h-8 rounded-full flex-center gap-0.5 hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          transition={SPRING_SNAPPY}
        >
          <div className={cn("w-4.5 h-4.5 rounded-full", currentColor?.bg)} />
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="w-auto p-2 rounded-2xl z-50 bg-background/80 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        sideOffset={8}
      >
        <div className="flex items-center gap-1">
          {COLORS.map((c) => {
            const isActive = color === c.value
            return (
              <motion.button
                key={c.value}
                onClick={() => { setColor(c.value); setOpen(false) }}
                className={cn(
                  "w-9 h-9 rounded-full flex-center",
                  isActive && "ring-2 ring-offset-2 ring-offset-background"
                )}
                style={isActive ? {
                  boxShadow: c.value !== PenColor.BLACK && c.value !== PenColor.WHITE
                    ? `0 0 10px ${c.hex}50`
                    : undefined,
                  ["--tw-ring-color" as any]: c.hex,
                } : undefined}
                whileTap={{ scale: 0.85 }}
                transition={SPRING_SNAPPY}
              >
                <div className={cn("w-5.5 h-5.5 rounded-full", c.bg)} />
              </motion.button>
            )
          })}
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
        <motion.button
          key={s.value}
          onClick={() => setSize(s.value)}
          className={cn(
            "w-8 h-8 rounded-full flex-center",
            size === s.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
          )}
          whileTap={{ scale: 0.85 }}
          transition={SPRING_SNAPPY}
        >
          <div className={cn("rounded-full bg-foreground", s.dotClass)} />
        </motion.button>
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
        <motion.button
          className="w-8 h-8 rounded-full flex-center gap-0.5 hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          transition={SPRING_SNAPPY}
        >
          <div className={cn("rounded-sm bg-foreground", currentSize?.lineClass)} />
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="w-auto p-2 rounded-2xl z-50 bg-background/80 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        sideOffset={8}
      >
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <motion.button
              key={s.value}
              onClick={() => { setSize(s.value); setOpen(false) }}
              className={cn(
                "w-9 h-9 rounded-full flex-center",
                size === s.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
              )}
              whileTap={{ scale: 0.85 }}
              transition={SPRING_SNAPPY}
            >
              <div className={cn("rounded-sm bg-foreground", s.lineClass)} />
            </motion.button>
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
        <motion.button
          key={f.value}
          onClick={() => setFontSize(f.value)}
          className={cn(
            "h-8 min-w-[32px] px-1.5 rounded-lg text-xs font-medium transition-colors relative",
            fontSize === f.value
              ? "text-foreground"
              : "text-foreground/50 hover:text-foreground/70"
          )}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_SNAPPY}
        >
          {fontSize === f.value && (
            <motion.div
              layoutId="annotation-fontsize-indicator"
              className="absolute inset-0 bg-foreground/10 dark:bg-white/15 rounded-lg"
              transition={SPRING_SNAPPY}
            />
          )}
          <span className="relative z-[1]">{f.label}</span>
        </motion.button>
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
        <motion.button
          className="h-8 px-2 rounded-full flex items-center gap-0.5 hover:bg-white/10 transition-colors text-xs font-medium"
          whileTap={{ scale: 0.9 }}
          transition={SPRING_SNAPPY}
        >
          {currentLabel}
          <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="w-auto p-2 rounded-2xl z-50 bg-background/80 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        sideOffset={8}
      >
        <div className="flex items-center gap-1">
          {FONT_SIZES.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => { setFontSize(f.value); setOpen(false) }}
              className={cn(
                "h-9 min-w-[36px] px-2 rounded-xl text-sm font-medium transition-colors",
                fontSize === f.value
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              )}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_SNAPPY}
            >
              {f.label}
            </motion.button>
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
  const isActive = fontWeight === "bold"
  return (
    <motion.button
      onClick={() => setFontWeight(isActive ? "normal" : "bold")}
      className={cn(
        "p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors relative",
        isActive
          ? "text-foreground"
          : "text-foreground/50 hover:text-foreground/70"
      )}
      whileTap={{ scale: 0.9 }}
      transition={SPRING_SNAPPY}
    >
      {isActive && (
        <motion.div
          layoutId="annotation-bold-indicator"
          className="absolute inset-0 bg-foreground/10 dark:bg-white/15 rounded-xl"
          transition={SPRING_SNAPPY}
        />
      )}
      <Bold className="w-4 h-4 relative z-[1]" />
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
// Delete Button (SELECT mode only, when selection exists)
// ---------------------------------------------------------------------------

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <motion.button
      onClick={onDelete}
      className="p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
      whileTap={{ scale: 0.85 }}
      transition={SPRING_SNAPPY}
    >
      <Trash2 className="w-4 h-4" />
    </motion.button>
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
            <GlassDivider />
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
            <GlassDivider />
            <FontSizePickerInline fontSize={fontSize} setFontSize={setFontSize} />
            <GlassDivider />
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
    <div className="px-2 pt-2 pb-1">
      {/* Glass container */}
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-background/60 dark:bg-neutral-900/60",
          "backdrop-blur-2xl",
          "border border-white/15 dark:border-white/10",
          "shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]",
        )}
      >
        {/* Main toolbar row */}
        <div className="flex items-center h-12 px-2 gap-0.5">
          {/* Left zone: Close + Undo/Redo + Clear All */}
          <motion.button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-foreground/[0.06] transition-colors"
            whileTap={{ scale: 0.88 }}
            transition={SPRING_SNAPPY}
          >
            <X className="w-[18px] h-[18px]" />
          </motion.button>

          <GlassDivider />

          <motion.button
            onClick={() => activeCanvas?.undo()}
            disabled={!activeCanvas?.canUndo}
            className={cn(
              "p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors",
              activeCanvas?.canUndo
                ? "text-foreground hover:bg-foreground/[0.06]"
                : "text-foreground/20 cursor-default"
            )}
            whileTap={activeCanvas?.canUndo ? { scale: 0.88 } : undefined}
            transition={SPRING_SNAPPY}
          >
            <Undo2 className="w-[17px] h-[17px]" />
          </motion.button>
          <motion.button
            onClick={() => activeCanvas?.redo()}
            disabled={!activeCanvas?.canRedo}
            className={cn(
              "p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors",
              activeCanvas?.canRedo
                ? "text-foreground hover:bg-foreground/[0.06]"
                : "text-foreground/20 cursor-default"
            )}
            whileTap={activeCanvas?.canRedo ? { scale: 0.88 } : undefined}
            transition={SPRING_SNAPPY}
          >
            <Redo2 className="w-[17px] h-[17px]" />
          </motion.button>

          {/* Clear all with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                disabled={!activeCanvas || !activeCanvas.canClear}
                className={cn(
                  "p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors",
                  (activeCanvas && activeCanvas.canClear)
                    ? "text-red-500 hover:bg-red-500/10"
                    : "text-foreground/20 cursor-default"
                )}
                whileTap={(activeCanvas && activeCanvas.canClear) ? { scale: 0.88 } : undefined}
                transition={SPRING_SNAPPY}
              >
                <ListX className="w-[17px] h-[17px]" />
              </motion.button>
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

          <GlassDivider />

          {/* Center zone: Tool buttons (Segmented Control) */}
          <div className="flex items-center flex-1 justify-center">
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          <GlassDivider />

          {/* Right zone: Pagination + Save status */}
          <div className="flex items-center gap-0">
            <motion.button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl hover:bg-foreground/[0.06] transition-colors disabled:opacity-30"
              whileTap={currentPage !== 1 ? { scale: 0.85 } : undefined}
              transition={SPRING_SNAPPY}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-xs font-medium tabular-nums min-w-[36px] text-center text-muted-foreground">
              {currentPage}/{totalPages}
            </span>
            <motion.button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl hover:bg-foreground/[0.06] transition-colors disabled:opacity-30"
              whileTap={currentPage !== totalPages ? { scale: 0.85 } : undefined}
              transition={SPRING_SNAPPY}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="w-7 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeCanvas?.isSaving && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={SPRING_GENTLE}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </motion.div>
              )}
              {activeCanvas && !activeCanvas.isSaving && activeCanvas.saveError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={SPRING_GENTLE}
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </motion.div>
              )}
              {activeCanvas && !activeCanvas.isSaving && !activeCanvas.saveError && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={SPRING_GENTLE}
                >
                  <Check className="w-4 h-4 text-muted-foreground/50" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contextual settings row - animated in/out */}
        <AnimatePresence initial={false}>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 44, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING_GENTLE}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-center h-11 px-3 gap-1 border-t border-foreground/[0.06]">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
