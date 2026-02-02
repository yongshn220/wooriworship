import { useRecoilValue } from "recoil";
import { musicSheetAtom } from "@/global-states/music-sheet-state";

export function SongKeyBox({ teamId, songId, musicSheetId }: { teamId: string, songId: string, musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }))

  return (
    <>
      {
        musicSheet?.key &&
        <div className="flex-center gap-1 text-xs text-white font-medium bg-gray-400 rounded-full min-w-5 h-5 px-2 py-1">
          <span>{musicSheet.key}</span>
          {musicSheet.note && <span className="text-white/70 text-[10px]">{musicSheet.note}</span>}
        </div>
      }
    </>
  )
}
