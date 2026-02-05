import { getStroke } from "perfect-freehand"
import { Stroke, StrokePoint } from "@/models/sheet_annotation"

// Convert normalized (0-1) stroke to pixel coordinates for rendering
export function strokeToPixels(stroke: Stroke, width: number, height: number): Stroke {
  return {
    ...stroke,
    points: stroke.points.map(p => ({
      x: p.x * width,
      y: p.y * height,
      pressure: p.pressure,
    })),
  }
}

// Convert pixel stroke to normalized (0-1) for Firestore storage
export function strokeToNormalized(stroke: Stroke, width: number, height: number): Stroke {
  return {
    ...stroke,
    points: stroke.points.map(p => ({
      x: p.x / width,
      y: p.y / height,
      pressure: p.pressure,
    })),
  }
}

// Generate SVG path from a stroke using perfect-freehand
// Stroke points must be in PIXEL coordinates (not 0-1 normalized)
export function getStrokePath(stroke: Stroke, isComplete: boolean = true): string {
  const points = stroke.points.map(p => [p.x, p.y, p.pressure])
  if (points.length === 0) return ""

  const outlinePoints = getStroke(points, {
    size: stroke.size,  // pixel values: 4, 8, 12
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true,
    last: isComplete,
  })

  return getSvgPathFromStroke(outlinePoints)
}

// Official perfect-freehand SVG path conversion
// Ref: https://github.com/steveruizok/perfect-freehand#rendering
const average = (a: number, b: number) => (a + b) / 2

function getSvgPathFromStroke(points: number[][]): string {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  result += "Z"
  return result
}

// Hit-testing on normalized (0-1) coordinates (strokes stored as normalized)
export function isPointNearStroke(point: StrokePoint, stroke: Stroke, threshold: number = 0.02): boolean {
  const pts = stroke.points
  for (let i = 0; i < pts.length - 1; i++) {
    const dist = pointToSegmentDistance(
      point.x, point.y,
      pts[i].x, pts[i].y,
      pts[i + 1].x, pts[i + 1].y
    )
    if (dist < threshold) return true
  }
  if (pts.length === 1) {
    const dx = point.x - pts[0].x
    const dy = point.y - pts[0].y
    if (Math.sqrt(dx * dx + dy * dy) < threshold) return true
  }
  return false
}

function pointToSegmentDistance(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy

  if (lenSq === 0) {
    const ddx = px - ax
    const ddy = py - ay
    return Math.sqrt(ddx * ddx + ddy * ddy)
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  const projX = ax + t * dx
  const projY = ay + t * dy
  const ddx = px - projX
  const ddy = py - projY
  return Math.sqrt(ddx * ddx + ddy * ddy)
}

// Returns SVG-local pixel coordinates (for drawing)
export function toSvgPoint(clientX: number, clientY: number, svgRect: DOMRect, pressure: number = 0.5): StrokePoint {
  return {
    x: clientX - svgRect.left,
    y: clientY - svgRect.top,
    pressure,
  }
}

// Returns normalized 0-1 coordinates (for eraser hit-testing against stored strokes)
export function toNormalizedPoint(clientX: number, clientY: number, svgRect: DOMRect, pressure: number = 0.5): StrokePoint {
  return {
    x: (clientX - svgRect.left) / svgRect.width,
    y: (clientY - svgRect.top) / svgRect.height,
    pressure,
  }
}
