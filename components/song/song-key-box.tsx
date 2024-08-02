import {useRecoilValue} from "recoil";
import {musicSheetAtom} from "@/global-states/music-sheet-state";

export function SongKeyBox({musicSheetId}: {musicSheetId: string}) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))

  return (
    <div className="flex-center text-xs text-white font-medium bg-gray-400 rounded-sm w-5 h-5">{musicSheet?.key}</div>
  )
}
