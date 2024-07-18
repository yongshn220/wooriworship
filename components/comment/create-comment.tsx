"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import {auth} from "@/firebase";
import SongCommentService from "@/apis/SongCommentService";
import {toast} from "@/components/ui/use-toast";

interface Props {
  teamId: string
  songId: string
}

export function CreateComment({teamId, songId}: Props) {
  const [comment, setComment] = useState("")
  const authUser = auth.currentUser

  async function handleSubmit(e: any) {
    e.preventDefault()
    const docId = await SongCommentService.addNewSongComment(authUser.uid, teamId, songId, comment)
    if (!docId) {
      toast({title: "Fail to create a comment. Please try again."})
      return;
    }
    toast({title: "New song created successfully."})
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
