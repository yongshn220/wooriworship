"use client"
import {useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom} from "@/app/board/[teamId]/song/_states/song-board-states";
import {SongListItem} from "@/app/board/[teamId]/song/_components/song-list-item";
import {Separator} from "@/components/ui/separator";


export function SongListView() {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom)

  switch (songIdsLoadable.state) {
    case 'loading': return <></>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          <div>
            <div className="flex text-sm text-gray-500 px-6">
              <p className="flex-[0.5]">Title</p>
              <p className="flex-[0.2] text-center">Key</p>
              <p className="hidden lg:flex justify-end lg:flex-[0.4]">Version</p>
              <p className="flex-[0.7] text-end">Tag</p>
              <p className="flex-[0.5] text-end">Last used date</p>
            </div>
            <Separator/>
          </div>
          <div className="flex-center flex-col mx-2 box-border">
            {
              songIdsLoadable.contents.map((songId) => (
                <div key={songId} className="w-full">
                  <SongListItem songId={songId}/>
                  <Separator/>
                </div>
              ))
            }
          </div>
        </div>
      )
  }
}
