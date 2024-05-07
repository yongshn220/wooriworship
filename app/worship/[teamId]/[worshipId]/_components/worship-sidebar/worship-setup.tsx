"use client"

import {Worship} from "@/models/worship";
import {Song} from "@/models/song";
import {useSetRecoilState} from "recoil";
import {currentSongListAtom, currentWorshipAtom} from "@/app/worship/[teamId]/[worshipId]/_states/states";
import {useEffect} from "react";
import {toPlainObject} from "@/components/helper/helper-functions";


interface Props {
  worship: Worship
  songList: Array<Song>
}
export function WorshipSetup({worship, songList}: Props) {
  const setWorship = useSetRecoilState(currentWorshipAtom)
  const setSongList = useSetRecoilState(currentSongListAtom)

  useEffect(() => {
    let _songList = toPlainObject(songList)
    for (let song of _songList) {
      for (let header of worship.songs) {
        if (song.id === header.id)
          song.description = header.note
      }
    }
    setWorship(worship)
    setSongList(_songList)
  }, [setWorship, setSongList, worship, songList])

  return (
    <></>
  )
}
