"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import {auth} from "@/firebase";
import SongCommentService from "@/apis/SongCommentService";

export function CreateComment() {
  const [comment, setComment] = useState("")
  const teamId = useRecoilValue(currentTeamIdAtom)
  const authUser = auth.currentUser

  async function handleSubmit(e: any) {
    e.preventDefault()
    // FE-TODO: get songId, handle after server call
    const songId = "KpX3rvyzwYsJdSkscX7h"
    await SongCommentService.addNewSongComment(authUser.uid, teamId, songId, comment);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full flex flex-col py-4 px-2 m-0 gap-5 ">
        <Textarea
          className="h-20"
          placeholder="Create a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex-end">
          <Button type="submit">Post</Button>
        </div>
      </div>
    </form>
  )
}
