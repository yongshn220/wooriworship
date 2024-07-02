"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

export function CreateComment({postType, postId}) {
  const [comment, setComment] = useState({content: "", isSecret: false})

  async function handleSubmit(e: any) {
    e.preventDefault()

  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full flex flex-col py-4 px-2 m-0 gap-5 ">
        <Textarea
          className="h-20"
          placeholder="Create a comment"
          disabled={true}
        />
        <div className="flex-end">
          <Button type="submit" disabled={true}>Post</Button>
        </div>
      </div>
    </form>
  )
}
