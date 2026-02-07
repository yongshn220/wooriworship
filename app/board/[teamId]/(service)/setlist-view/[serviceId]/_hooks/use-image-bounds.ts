import { RefObject, useCallback, useEffect, useState } from "react"

export interface ImageBounds {
  offsetTop: number
  offsetLeft: number
  visibleWidth: number
  visibleHeight: number
}

export function useImageBounds(
  containerRef: RefObject<HTMLDivElement | null>,
  naturalWidth: number,
  naturalHeight: number
): ImageBounds {
  const [bounds, setBounds] = useState<ImageBounds>({
    offsetTop: 0,
    offsetLeft: 0,
    visibleWidth: 0,
    visibleHeight: 0,
  })

  const calculate = useCallback(() => {
    const container = containerRef.current
    if (!container || naturalWidth === 0 || naturalHeight === 0) {
      setBounds({ offsetTop: 0, offsetLeft: 0, visibleWidth: 0, visibleHeight: 0 })
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imageAspect = naturalWidth / naturalHeight
    const containerAspect = containerWidth / containerHeight

    let visibleWidth: number
    let visibleHeight: number
    let offsetTop: number
    let offsetLeft: number

    if (imageAspect > containerAspect) {
      // Image is wider: letterbox top/bottom
      visibleWidth = containerWidth
      visibleHeight = containerWidth / imageAspect
      offsetLeft = 0
      offsetTop = (containerHeight - visibleHeight) / 2
    } else {
      // Image is taller: letterbox left/right
      visibleHeight = containerHeight
      visibleWidth = containerHeight * imageAspect
      offsetTop = 0
      offsetLeft = (containerWidth - visibleWidth) / 2
    }

    setBounds({ offsetTop, offsetLeft, visibleWidth, visibleHeight })
  }, [containerRef, naturalWidth, naturalHeight])

  useEffect(() => {
    calculate()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      calculate()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [calculate, containerRef])

  return bounds
}
