import {Badge} from "@/components/ui/badge";
import {UserIcon} from "lucide-react";
import {CommentItemMenu} from "@/components/comment/comment-item-menu";
import React, {useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {useRecoilValue} from "recoil";
import {songCommentAtom} from "@/global-states/song-comment-state";
import {userAtom} from "@/global-states/userState";
import {auth} from "@/firebase";
import {timestampToDatePassedFromNow, timestampToDatePassedFromNowShorten} from "@/components/helper/helper-functions";


interface Props {
  commentId: string
}

export function CommentItem({commentId}: Props) {
  const comment = useRecoilValue(songCommentAtom(commentId))
  const user = useRecoilValue(userAtom(comment?.created_by.id))
  const currentUser = auth.currentUser
  const [isEditMode, setIsEditMode] = useState(false)


  return (
    <div className="flex flex-col py-5 gap-4 border-b border-gray-300">
      <div className="w-full flex justify-between">
        <div className="w-full flex-between gap-2 sm:gap-5">
          <div className="w-full flex items-center gap-1">
            <UserIcon className="w-4 h-4"/>
            <p className="text-sm font-semibold">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 text-right ml-2">{timestampToDatePassedFromNowShorten(comment?.created_by?.timestamp)}</p>
          </div>
          {(user?.id === currentUser?.uid) && <CommentItemMenu setIsEditMode={setIsEditMode}/>}
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
            <p className="text-sm leading-6 text-gray-900">{comment?.comment}</p>
        }
      <div>

      </div>
    </div>
  )
}
