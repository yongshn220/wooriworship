"use client"

import React, {useState, useEffect, useRef, useCallback} from 'react'
import {LoadingCircle} from "@/components/animation/loading-indicator";

export function PullToRefresh({ children }) {
  const [startY, setStartY] = useState(0)
  const [pulling, setPulling] = useState(false)
  const [loading, setLoading] = useState(false)
  const pullRef = useRef(null)
  const contentRef = useRef(null)

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    window.location.reload();
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    pullRef.current.style.height = '50px'
    await handleRefresh()
    reset()
  }, [handleRefresh])

  useEffect(() => {
    const content = contentRef.current
    const touchStart = (e) => {
      if (contentRef.current.scrollTop === 0) {
        setStartY(e.touches[0].clientY)
        setPulling(true)
      }
    }

    function touchMove(e) {
      if (!pulling) return
      const currentY = e.touches[0].clientY
      const pullDistance = currentY - startY
      if (pullDistance > 0 && pullDistance < 200) {
        pullRef.current.style.height = `${pullDistance}px`
      }
    }

    function touchEnd() {
      if (!pulling) return
      if (pullRef.current.offsetHeight > 100) {
        refresh()
      } else {
        reset()
      }
    }

    content.addEventListener('touchstart', touchStart)
    content.addEventListener('touchmove', touchMove)
    content.addEventListener('touchend', touchEnd)

    return () => {
      content.removeEventListener('touchstart', touchStart)
      content.removeEventListener('touchmove', touchMove)
      content.removeEventListener('touchend', touchEnd)
    }
  }, [refresh, startY, pulling])

  function reset() {
    pullRef.current.style.height = '0px'
    setPulling(false)
    setLoading(false)
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={pullRef}
        className="absolute top-0 left-0 w-full flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ height: 0 }}
      >
        <LoadingCircle/>
      </div>
      <div ref={contentRef} className="w-full h-full overflow-auto">
        {children}
      </div>
    </div>
  )
}
