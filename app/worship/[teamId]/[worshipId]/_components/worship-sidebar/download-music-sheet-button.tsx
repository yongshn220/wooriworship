'use client'

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {DownloadIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {saveAs} from 'file-saver';
import {useRecoilValue} from "recoil";
import {currentSongListAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useState} from "react";


export function DownloadMusicSheetButton() {
  const songList = useRecoilValue(currentSongListAtom)
  const [selectedSongIds, setSelectedSongIds] = useState<Array<string>>([])

  function handleDownload() {
    const downloadSongList = songList.filter((song) => selectedSongIds.includes(song.id))

    downloadSongList.forEach((song) => {
      song.music_sheet_urls.forEach(url => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
          saveAs(blob, song.title)
        };
        xhr.open('GET', url);
        xhr.send();
      })
    })
  }

  function handleSelectSong(songId: string) {
    if (selectedSongIds.includes(songId)) {
      setSelectedSongIds((prev) => ([...prev.filter((id) => id !== songId)]))
    }
    else {
      setSelectedSongIds((prev) => ([...prev, songId]))
    }
  }

  function handleSelectAll() {
    setSelectedSongIds(songList.map((song) => song.id))
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 pl-0">
          <DownloadIcon size={20} className=""/>
          <p>Download</p>
        </Button>
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
