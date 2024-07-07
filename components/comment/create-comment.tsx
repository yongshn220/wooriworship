"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";

export function CreateComment() {
  const [comment, setComment] = useState("")

  async function handleSubmit(e: any) {
    e.preventDefault()
    // firebase: on send comment.
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
