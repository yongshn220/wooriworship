import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddSongButton() {
  return (
    <div
      className={cn(
        "group w-full flex flex-col items-center justify-center h-32 rounded-3xl",
        "bg-white border border-gray-100 shadow-sm",
        "transition-all duration-300 ease-in-out cursor-pointer",
        "hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30",
        "active:scale-[0.98]"
      )}
    >
      <div className="flex-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
        <Plus className="w-6 h-6" />
      </div>
      <p className="text-gray-500 font-semibold group-hover:text-blue-700 transition-colors">
        Click to Add Song
      </p>
      <p className="text-xs text-gray-400 mt-1 font-medium group-hover:text-blue-400/80">
        Search from database
      </p>
    </div>
  )
}
