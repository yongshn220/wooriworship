import { atom } from "recoil"
import { AnnotationMode, PenColor, PenSize, FontSize, AnnotationCanvasCallbacks } from "@/models/sheet_annotation"

export const annotationDrawingModeAtom = atom<boolean>({
  key: 'annotationDrawingModeAtom',
  default: false,
})

export const annotationModeAtom = atom<AnnotationMode>({
  key: 'annotationModeAtom',
  default: AnnotationMode.SELECT,
})

export const annotationColorAtom = atom<string>({
  key: 'annotationColorAtom',
  default: PenColor.BLACK,
})

export const annotationSizeAtom = atom<PenSize>({
  key: 'annotationSizeAtom',
  default: PenSize.MEDIUM,
})

export const annotationFontSizeAtom = atom<number>({
  key: 'annotationFontSizeAtom',
  default: FontSize.MEDIUM,
})

export const annotationFontWeightAtom = atom<"normal" | "bold">({
  key: 'annotationFontWeightAtom',
  default: "normal",
})

export const selectedAnnotationIdAtom = atom<string[]>({
  key: 'selectedAnnotationIdAtom',
  default: [],
})

export const annotationEditorTargetAtom = atom<{ initialGlobalIndex: number } | null>({
  key: 'annotationEditorTargetAtom',
  default: null,
})

export const activeAnnotationCanvasAtom = atom<AnnotationCanvasCallbacks>({
  key: 'activeAnnotationCanvasAtom',
  default: null,
})
