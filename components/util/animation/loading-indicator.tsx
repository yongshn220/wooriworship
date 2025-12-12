import { Spinner } from "@/components/ui/spinner";

export function LoadingCircle() {
  return (
    <div className="w-full h-full flex-center z-50">
      <Spinner size={48} />
    </div>
  )
}
