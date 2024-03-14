import {HoverOverlay} from "@/components/hover-overlay";


export function WorshipCard() {
  return (
    <div>
      <div className="group aspect-[100/132] border rounded-lg flex flex-col overflow-hidden bg-gray-200">
        <HoverOverlay/>
        <p className="p-3 bg-white">
          footer
        </p>
      </div>
      <p className="w-full text-center text-sm text-gray-600 mt-1">
        March 30 <span className="text-xs">(Mon)</span>
      </p>
    </div>
  )
}
