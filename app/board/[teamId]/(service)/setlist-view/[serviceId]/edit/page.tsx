"use client"

import { Component, ReactNode, Suspense, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  annotationDrawingModeAtom,
  annotationModeAtom,
} from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_states/annotation-states"
import { setlistFlatPagesSelector } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_states/setlist-view-states"
import { AnnotationToolbar } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_components/annotation-toolbar"
import { AnnotationObjectMenu } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_components/annotation-object-menu"
import { AnnotationMode } from "@/models/sheet_annotation"
import { clearUndoStackCache } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_hooks/use-annotation"
import { useEdgeSwipe } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_hooks/use-edge-swipe"
import { useNaturalDimensions } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_hooks/use-natural-dimensions"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
const AnnotationCanvas = dynamic(() => import("@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_components/annotation-canvas").then(mod => mod.AnnotationCanvas), { ssr: false })

interface Props {
  params: {
    teamId: string
    serviceId: string
  }
  searchParams: {
    page?: string
  }
}

// Error Boundary Component
class EditPageErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Edit page error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
          <div className="text-destructive text-lg font-semibold">페이지를 불러올 수 없습니다</div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
              this.props.onReset()
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Loading Fallback Component
function LoadingFallback() {
  useEffect(() => {
    console.log('⏳ Loading Fallback showing')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">악보를 불러오는 중...</p>
      <p className="text-xs text-muted-foreground/50">Suspense boundary active</p>
    </div>
  )
}

// Main Content Component
function SetlistEditPageContent({ params, searchParams }: Props) {
  const router = useRouter()
  const globalPageIndex = parseInt(searchParams.page || "0")

  const setDrawingMode = useSetRecoilState(annotationDrawingModeAtom)
  const annotationMode = useRecoilValue(annotationModeAtom)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Get flat pages and current page info
  const flatPages = useRecoilValue(setlistFlatPagesSelector({
    teamId: params.teamId,
    serviceId: params.serviceId
  }))

  const currentPage = flatPages[globalPageIndex]

  // Use natural dimensions hook
  const naturalDimensions = useNaturalDimensions(currentPage?.url)

  // Debug logging
  useEffect(() => {
    console.log('🎯 Edit Page Render:', {
      globalPageIndex,
      flatPagesLength: flatPages.length,
      currentPage: currentPage ? {
        teamId: currentPage.teamId,
        songId: currentPage.songId,
        sheetId: currentPage.sheetId,
        pageIndex: currentPage.pageIndex,
        url: currentPage.url,
        urlLength: currentPage.url?.length
      } : null,
      naturalDimensions
    })
  }, [globalPageIndex, flatPages, currentPage, naturalDimensions])

  // Set drawing mode on mount/unmount
  useEffect(() => {
    setDrawingMode(true)
    return () => {
      setDrawingMode(false)
    }
  }, [setDrawingMode])

  const handleClose = useCallback(() => {
    clearUndoStackCache()
    setDrawingMode(false)  // 명시적으로 리셋
    router.push(`/board/${params.teamId}/setlist-view/${params.serviceId}?page=${globalPageIndex}`)
  }, [router, params, globalPageIndex, setDrawingMode])

  const handlePrevPage = useCallback(() => {
    if (globalPageIndex > 0) {
      router.push(`/board/${params.teamId}/setlist-view/${params.serviceId}/edit?page=${globalPageIndex - 1}`)
    } else {
      toast({ description: "첫 페이지입니다" })
    }
  }, [globalPageIndex, router, params])

  const handleNextPage = useCallback(() => {
    if (globalPageIndex < flatPages.length - 1) {
      router.push(`/board/${params.teamId}/setlist-view/${params.serviceId}/edit?page=${globalPageIndex + 1}`)
    } else {
      toast({ description: "마지막 페이지입니다" })
    }
  }, [globalPageIndex, flatPages.length, router, params])

  // Edge-swipe page navigation
  useEdgeSwipe({ wrapperRef, annotationMode, onPrevPage: handlePrevPage, onNextPage: handleNextPage })

  // Early return if no page
  if (!currentPage) {
    console.error('❌ No current page found:', { globalPageIndex, flatPagesLength: flatPages.length })
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
        <p className="text-destructive text-lg">페이지를 찾을 수 없습니다</p>
        <p className="text-sm text-muted-foreground">
          Page {globalPageIndex + 1} / {flatPages.length}
        </p>
        <button
          onClick={() => router.push(`/board/${params.teamId}/setlist-view/${params.serviceId}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-background">
      <AnnotationToolbar
        onClose={handleClose}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        currentPage={globalPageIndex + 1}
        totalPages={flatPages.length}
      />

      <AnnotationObjectMenu />

      <div ref={wrapperRef} className="flex-1 overflow-hidden relative bg-background" style={{ touchAction: "none" }}>
        {currentPage.url ? (
          <AnnotationCanvas
            teamId={currentPage.teamId}
            songId={currentPage.songId}
            sheetId={currentPage.sheetId}
            pageIndex={currentPage.pageIndex}
            isActiveSlide={true}
            naturalWidth={naturalDimensions.width}
            naturalHeight={naturalDimensions.height}
            imageUrl={currentPage.url}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">이미지 URL이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Page Component with Suspense and Error Boundary
export default function SetlistEditPage(props: Props) {
  const router = useRouter()

  return (
    <EditPageErrorBoundary
      onReset={() => {
        router.push(`/board/${props.params.teamId}/setlist-view/${props.params.serviceId}`)
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SetlistEditPageContent {...props} />
      </Suspense>
    </EditPageErrorBoundary>
  )
}
