import {atom, atomFamily, selectorFamily} from "recoil";
import {SongComment} from "@/models/song_comments";
import {SongCommentService} from "@/apis";

export const songCommentIdsAtom = atomFamily<Array<string>, {teamId: string, songId: string }>({
  key: "songCommentIdsAtom",
  default: selectorFamily({
    key: "songCommentIdsAtom/default",
    get: ({teamId, songId}) => async ({get}) => {
      if (!teamId || !songId) return []
      try {
        get(songCommentIdsUpdaterAtom)

        const commentList = await SongCommentService.getSongComments(songId, teamId)
        if (!commentList) return []

        return commentList.map((comment: SongComment) => comment.id)
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const songCommentIdsUpdaterAtom = atom({
  key: "songCommentIdsUpdaterAtom",
  default: 0
})


export const songCommentAtom = atomFamily<SongComment, string>({
  key: "songCommentAtom",
  default: selectorFamily({
    key: "songCommentAtom/default",
    get: (commentId) => async ({get}) => {
      try {
        get(songCommentUpdater)

        if (!commentId) return null

        const comment = await SongCommentService.getById(commentId) as SongComment
        if (!comment) return null

        return comment
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})

export const songCommentUpdater = atom({
  key: "songCommentUpdater",
  default: 0
})