"use client"

import { ErrorState } from "@/components/common/feedback/error-state";

export default function NotFound() {
  return (
    <ErrorState
      title="Page Not Found"
      description="Sorry, we couldn't find the page you're looking for. It might have been removed or the link might be broken."
      image="not-found"
      fullScreen={true}
    />
  )
}