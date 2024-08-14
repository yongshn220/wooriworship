import {useRecoilValue} from "recoil";
import {musicSheetAtom} from "@/global-states/music-sheet-state";

export function SongKeyBox({musicSheetId}: {musicSheetId: string}) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))

  return (
    <>
      {
        musicSheet?.key &&
        <div className="flex-center text-xs text-white font-medium bg-gray-400 rounded-sm min-w-5 min-h-5 p-1">{musicSheet?.key}</div>
      }
    </>
  )
}
