import {LoadingCircle} from "@/components/animation/loading-indicator";

export function CenterLoadingCircle() {
  return (
    <div className="absolute left-0 top-0 w-full h-full flex-center">
      <LoadingCircle/>
    </div>
  )
}
