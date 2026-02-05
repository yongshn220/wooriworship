import { Timestamp } from "firebase/firestore"

export type StrokePoint = {
  x: number        // normalized 0-1 (relative to visible image width)
  y: number        // normalized 0-1 (relative to visible image height)
  pressure: number  // 0-1
}

export type Stroke = {
  id: string                // uuid
  points: StrokePoint[]     // array of points
  color: string             // hex color: "#000000" | "#EF4444" | "#3B82F6"
  size: number              // thickness: 4 | 8 | 12
  timestamp: number         // Date.now() for ordering
}

export type SheetAnnotation = {
  strokes: Stroke[]         // all strokes for this page
  page_index: number        // which page (url index) within the sheet
  updated_at: Timestamp     // Firestore server timestamp
}

export enum PenColor {
  BLACK = "#000000",
  RED = "#EF4444",
  BLUE = "#3B82F6",
}

export enum PenSize {
  THIN = 4,
  MEDIUM = 8,
  THICK = 12,
}

export enum DrawingTool {
  PEN = "PEN",
  ERASER = "ERASER",
}

export type AnnotationCanvasCallbacks = {
  undo: () => void
  redo: () => void
  clearAll: () => void
  canUndo: boolean
  canRedo: boolean
  canClear: boolean
} | null
