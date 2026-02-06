import { Timestamp } from "firebase/firestore"

export type AnnotationObjectType = "freehand" | "text"

export type FreehandPoint = { x: number; y: number }  // normalized 0-1

export interface FreehandObject {
  id: string
  type: "freehand"
  points: FreehandPoint[]       // normalized 0-1
  color: string                 // hex color
  strokeWidth: number           // pixel value for rendering: 2, 4, 8
  timestamp: number
}

export interface TextObject {
  id: string
  type: "text"
  x: number                     // normalized 0-1
  y: number                     // normalized 0-1
  text: string
  fontSize: number              // 14, 18, 24, 32
  fontWeight: "normal" | "bold"
  color: string                 // hex color
  width?: number                // normalized 0-1 (optional, for text wrapping)
  timestamp: number
}

export type AnnotationObject = FreehandObject | TextObject

export type SheetAnnotation = {
  objects: AnnotationObject[]
  page_index: number
  updated_at: Timestamp
}

// Toolbar enums
export enum PenColor {
  BLACK = "#000000",
  RED = "#EF4444",
  BLUE = "#3B82F6",
  GREEN = "#22C55E",
  ORANGE = "#F97316",
  PURPLE = "#A855F7",
  GRAY = "#6B7280",
}

export enum PenSize {
  THIN = 2,
  MEDIUM = 4,
  THICK = 8,
}

export enum AnnotationMode {
  SELECT = "SELECT",
  PEN = "PEN",
  TEXT = "TEXT",
  ERASER = "ERASER",
}

export enum FontSize {
  SMALL = 14,
  MEDIUM = 18,
  LARGE = 24,
  XLARGE = 32,
}

// Callback bridge between canvas and toolbar
export type AnnotationCanvasCallbacks = {
  undo: () => void
  redo: () => void
  clearAll: () => void
  deleteSelected: () => void
  canUndo: boolean
  canRedo: boolean
  canClear: boolean
  hasSelection: boolean
  isSaving: boolean
  saveError: string | null
} | null
