"use client"

import {Worship} from "@/models/worship";
import {Song} from "@/models/song";
import {useSetRecoilState} from "recoil";
import {currentSongListAtom, currentWorshipAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useEffect} from "react";
import {toPlainObject} from "@/components/helper/helper-functions";
import {SongService, WorshipService} from "@/apis";


interface Props {
  worshipId: string
}
export function WorshipSetup({worshipId}: Props) {
  const setWorship = useSetRecoilState(currentWorshipAtom)
  const setSongList = useSetRecoilState(currentSongListAtom)

  useEffect(() => {
    async function init() {
      const worship = await WorshipService.getById(worshipId) as Worship
      setWorship(worship)

      const songListPromise = worship?.songs?.map(header => SongService.getById(header.id))
      if (!songListPromise) return

      let songList = toPlainObject(await Promise.all(songListPromise)) as Array<Song>
      for (let song of songList) {
        for (let header of worship.songs) {
          if (song.id === header.id)
            song.description = header.note
        }
      }
      setSongList(songList)
    }

    init().then()

  }, [setSongList, setWorship, worshipId])

  return (
    <></>
  )
}
