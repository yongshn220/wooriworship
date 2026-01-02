"use client";

import { ErrorState } from "@/components/common/feedback/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function BoardTeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="Oops! Something went wrong."
      description="We encountered an unexpected error while loading the board. Please try again or contact support if the issue persists."
      image="error"
      fullScreen={false}
      action={
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <Button
            onClick={reset}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-semibold shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/board"}
            className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full text-base font-medium"
          >
            Go Home
          </Button>
        </div>
      }
    />
  )
}
