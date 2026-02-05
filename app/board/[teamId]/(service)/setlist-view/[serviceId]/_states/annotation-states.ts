import { atom } from "recoil"
import { DrawingTool, PenColor, PenSize, AnnotationCanvasCallbacks } from "@/models/sheet_annotation"

export const annotationDrawingModeAtom = atom<boolean>({
  key: 'annotationDrawingModeAtom',
  default: false,
})

export const annotationToolAtom = atom<DrawingTool>({
  key: 'annotationToolAtom',
  default: DrawingTool.PEN,
})

export const annotationColorAtom = atom<PenColor>({
  key: 'annotationColorAtom',
  default: PenColor.BLACK,
})

export const annotationSizeAtom = atom<PenSize>({
  key: 'annotationSizeAtom',
  default: PenSize.MEDIUM,
})

export const activeAnnotationCanvasAtom = atom<AnnotationCanvasCallbacks>({
  key: 'activeAnnotationCanvasAtom',
  default: null,
})
