import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { musicSheetAtom, musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
import { selectedWorshipSongHeaderListAtom } from "@/global-states/worship-creation-state";

interface Props {
  teamId: string
  songId: string,
  isStatic?: boolean
  onSelectHandler: () => void
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
}

export function MusicKeySelector({ teamId, songId, isStatic = false, onSelectHandler, selectedMusicSheetIds, setMusicSheetIds }: Props) {

  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom({ teamId, songId }))
  const [selectedSongHeaderList, setSelectedSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)

  function handleSelectSong() {
    if (isStatic) return
    onSelectHandler()
  }

  function handleUnselectSong() {
    if (isStatic) return
    onSelectHandler()
  }

  function handleSelectMusicSheetKey(id: string) {
    if (isMusicSheetSelected(id)) {
      setMusicSheetIds([...selectedMusicSheetIds?.filter((_id) => _id !== id)])
    }
    else {
      setMusicSheetIds([...selectedMusicSheetIds, id])
    }
  }

  function isMusicSheetSelected(id: string) {
    return selectedMusicSheetIds?.includes(id)
  }
  function isSongAdded() {
    return selectedSongHeaderList.map((songHeader => songHeader?.id)).includes(songId)
  }
  return (
    <div className="flex-between flex-col h-4/5 p-6 text-white">
      <div className="w-full h-full flex-center flex-col gap-4">
        <p className="text-3xl font-semibold">Select Keys</p>
        <div className="flex-center gap-2">
          {
            musicSheets?.map((sheet, index) => (
              <div
                key={index}
                className={
                  cn(
                    "flex-center w-16 h-16 border-2 rounded-lg cursor-pointer transition-all font-bold text-lg",
                    // Use robust coloring: White text/border on dark bg, or Gray on light bg?
                    // Since parent is usually blue, we keep white/transparent for unselected, 
                    // but we can make it more opaque or use a filled bg for better contrast.
                    // Actually, if background is white, text-white is bad. 
                    // Let's use current context: It expects a dark baground (blue-500).
                    // If proper parent is used, it works. 
                    // But to be safe, let's just ensure high contrast.
                    "border-white/40 text-white hover:bg-white/10 hover:border-white/60",
                    { "bg-white text-blue-600 border-white shadow-lg scale-105": isMusicSheetSelected(sheet?.id) },
                  )
                }
                onClick={() => handleSelectMusicSheetKey(sheet?.id)}
              >
                {sheet?.key}
              </div>
            ))
          }
        </div>
      </div>
      <div className="w-full flex-center flex-col gap-2">
        {
          isStatic === false &&
          <>
            <div className="flex text-black">
              <p className="pr-2">selected: </p>
              <div className="flex gap-2">
                {
                  selectedMusicSheetIds?.map((id, index) => (
                    <MusicSheetKeyString key={index} teamId={teamId} songId={songId} musicSheetId={id} />
                  ))
                }
              </div>
            </div>
            {
              isSongAdded()
                ? <Button className="w-full bg-blue-500 hover:bg-blue-500 hover:border-2 hover:text-white"
                  variant="outline" onClick={() => handleUnselectSong()}>Click to Remove Song</Button>
                : <Button className="w-full" onClick={() => handleSelectSong()} disabled={selectedMusicSheetIds.length === 0}>Click to Add Song</Button>
            }
          </>
        }
      </div>
    </div>
  )
}


interface MusicSheetKeysToStringProps {
  teamId: string
  songId: string
  musicSheetId: string
}
function MusicSheetKeyString({ teamId, songId, musicSheetId }: MusicSheetKeysToStringProps) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }))

  return (
    <p>{musicSheet?.key}</p>
  )
}
