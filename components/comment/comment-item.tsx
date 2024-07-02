import {Badge} from "@/components/ui/badge";
import {UserIcon} from "lucide-react";


export function CommentItem() {
  return (
    <div className="flex flex-col py-5 gap-4 border-b border-gray-300">
      <div className="w-full flex justify-between">
        <div className="w-full flex-between flex-col gap-2 sm:flex-row sm:gap-5">
          <div className="flex flex-center gap-2">
            <UserIcon/>
            <p className="text-sm font-semibold">
              yongjung.shin@gmail.com
            </p>
            {true && <Badge className="bg-blue-400 hover:bg-blue-400">Me</Badge>}
          </div>
          <p className="text-sm text-gray-500">1 months ago</p>
        </div>
      </div>
        <p className="text-sm leading-6 text-gray-900">This is a test comment. Comment will be available soon.</p>
      <div>
      </div>
    </div>
  )
}
