import {Badge} from "@/components/ui/badge";
import {EllipsisIcon, UserIcon} from "lucide-react";
import {CommentItemMenu} from "@/components/comment/comment-item-menu";
import React, {useState} from "react";
import {Textarea} from "@/components/ui/textarea";


export function CommentItem() {
  const [isEditMode, setIsEditMode] = useState(false)

  const email = "yongjung.shin@gmail.com"

  return (
    <div className="flex flex-col py-5 gap-4 border-b border-gray-300">
      <div className="w-full flex justify-between">
        <div className="w-full flex-between gap-2 sm:gap-5">
          <div className="w-full flex gap-2">
            <UserIcon/>
            <p className="text-sm font-semibold">
              {email.includes('@') ? email.split('@')[0] : email}
            </p>
            {true && <Badge className="text-xs bg-blue-400 hover:bg-blue-400">Me</Badge>}
            <CommentItemMenu setIsEditMode={setIsEditMode}/>
          </div>
          <p className="w-full text-sm text-gray-500 text-right">1 min</p>
        </div>
      </div>
        {
          isEditMode ?
            <div className="w-full flex-end flex-col">
              <Textarea className="h-20" placeholder="Create a comment" disabled={true}/>
              <div className="w-full flex-end mt-2 gap-4">
                <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                   onClick={() => setIsEditMode(false)}>Cancel</p>
                <p className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
                   onClick={() => setIsEditMode(false)}>Save</p>
              </div>
            </div>
            :
            <p className="text-sm leading-6 text-gray-900">This is a test comment. Comment will be available soon.</p>
        }
      <div>

      </div>
    </div>
  )
}
