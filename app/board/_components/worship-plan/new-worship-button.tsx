import {Plus} from "lucide-react";


export function NewWorshipButton() {
  return (
    <button className="group aspect-[100/132] border rounded-lg flex-center flex-col overflow-hidden bg-blue-500 hover:bg-blue-600">
      <Plus className="h-12 w-12 text-white stroke-1"/>
      <p className="text-sm text-white">New board</p>
    </button>
  )
}
