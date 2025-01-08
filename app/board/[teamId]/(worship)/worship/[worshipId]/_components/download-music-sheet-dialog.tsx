'use client'

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {useRecoilValue} from "recoil";
import {useState} from "react";
import {worshipSongListAtom} from "@/global-states/worship-state";
import {downloadMultipleMusicSheets} from "@/components/util/helper/helper-functions";

interface Props {
  children: any
  worshipId: string
}

export function DownloadMusicSheetDialog({children,  worshipId}: Props) {
  const songList = useRecoilValue(worshipSongListAtom(worshipId))
  const [selectedSongIds, setSelectedSongIds] = useState<Array<string>>([])

  async function handleDownload() {
    const downloadSongList = songList.filter((song) => selectedSongIds.includes(song.id))

    await downloadMultipleMusicSheets(downloadSongList)
  }

  function handleSelectSong(songId: string) {
    if (selectedSongIds.includes(songId)) {
      setSelectedSongIds((prev) => ([...prev.filter((id) => id !== songId)]))
    }
    else {
      setSelectedSongIds((prev) => ([...prev, songId]))
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="w-full flex-start flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download music sheets</DialogTitle>
          <DialogDescription>Select songs you want to download.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 mt-5">
          {
            songList.map((song) => (
              <div key={song?.id} className="flex items-center space-x-5">
                <Checkbox id={song?.id} checked={selectedSongIds.includes(song?.id)} onClick={() => handleSelectSong(song?.id)}/>
                <label htmlFor={song?.id} className="font-medium cursor-pointer">
                  {song?.title}
                </label>
              </div>
            ))
          }
        </div>
        <div className="w-full flex-center space-x-4">
          {
            (songList.length === selectedSongIds.length)
              ? <Button variant="outline" className="cursor-pointer" onClick={() => setSelectedSongIds([])}>Unselect All</Button>
              : <Button variant="outline" className="cursor-pointer" onClick={() => setSelectedSongIds(songList.map((song) => song.id))}>Select All</Button>
          }
          <Button className="cursor-pointer" onClick={handleDownload}>Download</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
