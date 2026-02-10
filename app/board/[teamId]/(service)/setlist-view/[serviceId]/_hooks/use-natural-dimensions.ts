import { useEffect, useState } from "react"

export function useNaturalDimensions(url: string | undefined) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    if (!url) return

    let cancelled = false
    const img = new window.Image()
    img.onload = () => {
      if (!cancelled) {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
    }
    img.src = url
    return () => { cancelled = true }
  }, [url])

  return dimensions
}
