import {CreateComment} from "@/components/comment/create-comment";
import {Separator} from "@/components/ui/separator";
import {CommentItem} from "@/components/comment/comment-item";
import {useRecoilValue} from "recoil";
import {songCommentIdsAtom} from "@/global-states/song-comment-state";


interface Props {
  teamId: string
  songId: string
}

export function SongCommentArea({teamId, songId}: Props) {
  const commentIds = useRecoilValue(songCommentIdsAtom({teamId, songId}))
  return (
    <div className="w-full mt-5 ">
      <p>3 Comments</p>
      <Separator className="my-4"/>
      {
        commentIds.map((commentId, index) => (
          <CommentItem key={index} commentId={commentId}/>
        ))
      }
      <CreateComment teamId={teamId} songId={songId} />
    </div>
  )
}
