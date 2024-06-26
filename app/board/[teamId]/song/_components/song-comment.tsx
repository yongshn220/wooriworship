import {CreateComment} from "@/components/comment/create-comment";
import {Separator} from "@/components/ui/separator";
import {CommentItem} from "@/components/comment/comment-item";


export function SongComment() {
  return (
    <div className="w-full mt-5 ">
      <Separator className="my-4"/>
      <p>3 Comments</p>
      <CreateComment/>
      <CommentItem/>
      <CommentItem/>
      <CommentItem/>
    </div>
  )
}
