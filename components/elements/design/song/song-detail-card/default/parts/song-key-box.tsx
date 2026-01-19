import { useRecoilValue } from "recoil";
import { musicSheetAtom } from "@/global-states/music-sheet-state";

export function SongKeyBox({ teamId, songId, musicSheetId }: { teamId: string, songId: string, musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }))

  return (
    <>
      {
        musicSheet?.key &&
        <div className="flex-center text-xs text-white font-medium bg-gray-400 rounded-full min-w-5 h-5 p-1">{musicSheet?.key}</div>
      }
    </>
  )
}
