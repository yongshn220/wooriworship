import { atom, atomFamily, selectorFamily } from "recoil";
import { SongComment } from "@/models/song_comments";
import { SongCommentService } from "@/apis";

export const songCommentIdsAtom = atomFamily<Array<string>, { teamId: string, songId: string }>({
  key: "songCommentIdsAtom",
  default: selectorFamily({
    key: "songCommentIdsAtom/default",
    get: (props: { teamId: string, songId: string }) => async ({ get }) => {
      if (!props?.teamId || !props?.songId) return []
      try {
        get(songCommentIdsUpdaterAtom)

        const commentList = await SongCommentService.getSongComments(props?.songId, props?.teamId) as Array<SongComment>
        if (!commentList) return []

        return commentList.map((comment: SongComment) => comment.id)
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  })
})

export const songCommentIdsUpdaterAtom = atom({
  key: "songCommentIdsUpdaterAtom",
  default: 0
})


export const songCommentAtom = atomFamily<SongComment, { teamId: string, songId: string, commentId: string }>({
  key: "songCommentAtom",
  default: selectorFamily({
    key: "songCommentAtom/default",
    get: ({ teamId, songId, commentId }) => async ({ get }) => {
      try {
        get(songCommentUpdater)

        if (!commentId) return null

        const comment = await SongCommentService.getById(teamId, songId, commentId) as SongComment
        if (!comment) return null

        return comment
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})

export const songCommentUpdater = atom({
  key: "songCommentUpdater",
  default: 0
})
