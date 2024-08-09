import {UserIcon} from "lucide-react";
import {CommentItemMenu} from "@/components/comment/comment-item-menu";
import React, {useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {songCommentAtom, songCommentUpdater} from "@/global-states/song-comment-state";
import {userAtom} from "@/global-states/userState";
import {auth} from "@/firebase";
import {getTimePassedFromTimestampShorten} from "@/components/helper/helper-functions";
import {SongCommentService} from "@/apis";
import {toast} from "@/components/ui/use-toast";


interface Props {
  commentId: string
}

export function CommentItem({commentId}: Props) {
  const setCommentUpdater = useSetRecoilState(songCommentUpdater)
  const comment = useRecoilValue(songCommentAtom(commentId))
  const user = useRecoilValue(userAtom(comment?.created_by.id))
  const currentUser = auth.currentUser
  const [isEditMode, setIsEditMode] = useState(false)
  const [commentInput, setCommentInput] = useState<string>(comment?.comment ?? "")

  async function handleEditComment() {
    if (!await SongCommentService.updateSongComment(commentId, commentInput)) {
      toast({description: "Fail to edit comment. Please try again."})
      return;
    }
    setCommentUpdater(prev => prev + 1)
    setIsEditMode(false)
    toast({description: "Comment updated successfully."})
  }

  return (
    <div className="flex flex-col py-5 gap-4 border-b border-gray-300">
      <div className="w-full flex justify-between">
        <div className="w-full flex-between gap-2 sm:gap-5">
          <div className="w-full flex items-center gap-1">
            <UserIcon className="w-4 h-4"/>
            <p className="text-sm font-semibold">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 text-right ml-2">{getTimePassedFromTimestampShorten(comment?.created_by?.timestamp)}</p>
          </div>
          {(user?.id === currentUser?.uid) && <CommentItemMenu setIsEditMode={setIsEditMode}/>}
        </div>
      </div>
        {
          isEditMode ?
            <div className="w-full flex-end flex-col p-2">
              <Textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} className="h-20" />
              <div className="w-full flex-end mt-2 gap-4">
                <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                   onClick={() => setIsEditMode(false)}>Cancel</p>
                <p className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
                   onClick={() => handleEditComment()}>Save</p>
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
