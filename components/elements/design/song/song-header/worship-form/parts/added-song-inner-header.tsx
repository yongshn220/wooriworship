import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongKeyBox} from "@/components/elements/design/song/song-detail-card/default/parts/song-key-box";

interface Props {
  songId: string
  selectedMusicSheetIds: Array<string>
  customTags?: string[]
}

export function AddedSongInnerHeader({songId, selectedMusicSheetIds, customTags=[]}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <div className="flex w-full px-4 rounded-lg cursor-pointer py-2 my-2 hover:bg-gray-100">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center flex-grow min-w-0 gap-2">
            <p className="font-semibold text-md">
              {song?.title}
              <span className="text-sm text-gray-500">
                {song?.subtitle ? ` (${song.subtitle})` : ""}
              </span>
            </p>
            {
              selectedMusicSheetIds?.map((id, index) => (
                <SongKeyBox key={index} musicSheetId={id}/>
              ))
            }
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {
              song?.version && (
                <div className="flex-center text-sm font-medium border-2 border-gray-300 rounded-sm h-5 px-1 text-gray-500">
                  {song?.version}
                </div>
              )
            }
            {
              customTags.map((tag, index) => (
                <div key={index} className="flex-center text-sm bg-indigo-300 rounded-sm h-5 p-1 text-white">
                  {tag}
                </div>
              ))
            }
          </div>
        </div>
        <p className="text-sm text-gray-500">{song?.original.author === "" ? "unknown" : song?.original.author}</p>
      </div>
    </div>
  )
}
