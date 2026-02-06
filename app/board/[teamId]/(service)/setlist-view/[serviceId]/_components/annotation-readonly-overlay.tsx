"use client"

import { useRef, useCallback } from "react"
import { Stage, Layer, Line, Text } from "react-konva"
import { FreehandObject, TextObject, FreehandPoint } from "@/models/sheet_annotation"
import { useAnnotation } from "../_hooks/use-annotation"
import { useImageBounds } from "../_hooks/use-image-bounds"

interface Props {
  teamId: string
  songId: string
  sheetId: string
  pageIndex: number
  naturalWidth: number
  naturalHeight: number
}

export function AnnotationReadonlyOverlay({
  teamId,
  songId,
  sheetId,
  pageIndex,
  naturalWidth,
  naturalHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bounds = useImageBounds(containerRef, naturalWidth, naturalHeight)

  const { objects } = useAnnotation({ teamId, songId, sheetId, pageIndex })

  const denormalizePoints = useCallback(
    (points: FreehandPoint[]): number[] =>
      points.flatMap((p) => [p.x * bounds.visibleWidth, p.y * bounds.visibleHeight]),
    [bounds.visibleWidth, bounds.visibleHeight],
  )

  if (naturalWidth === 0 || naturalHeight === 0) return null
  if (objects.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
    >
      <Stage
        width={bounds.visibleWidth}
        height={bounds.visibleHeight}
        listening={false}
        style={{
          position: "absolute",
          top: bounds.offsetTop,
          left: bounds.offsetLeft,
          pointerEvents: "none",
        }}
      >
        <Layer listening={false}>
          {bounds.visibleWidth > 0 &&
            objects
              .filter((obj): obj is FreehandObject => obj.type === "freehand")
              .map((obj) => (
                <Line
                  key={obj.id}
                  points={denormalizePoints(obj.points)}
                  stroke={obj.color}
                  strokeWidth={obj.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.3}
                  listening={false}
                />
              ))}

          {bounds.visibleWidth > 0 &&
            objects
              .filter((obj): obj is TextObject => obj.type === "text")
              .map((obj) => (
                <Text
                  key={obj.id}
                  x={obj.x * bounds.visibleWidth}
                  y={obj.y * bounds.visibleHeight}
                  text={obj.text}
                  fontSize={obj.fontSize}
                  fontStyle={obj.fontWeight === "bold" ? "bold" : "normal"}
                  fill={obj.color}
                  width={obj.width ? obj.width * bounds.visibleWidth : undefined}
                  listening={false}
                />
              ))}
        </Layer>
      </Stage>
    </div>
  )
}
