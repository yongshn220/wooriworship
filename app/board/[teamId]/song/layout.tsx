import {NewButton} from "@/app/board/[teamId]/song/_components/new-button";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {SongCardList} from "@/app/board/[teamId]/song/_components/song-card-list";

export default async function SongLayout({params, children}: any) {
  const teamId = params.teamId

  return (
    <>
      {children}
      <PageInit teamId={teamId} page={Page.SONG}/>
      <div className="w-full h-full flex flex-col items-center">
        <div className="flex-between w-full m-4">
          <p className="text-2xl font-semibold">
            Songs
          </p>
          <NewButton/>
        </div>
        <SongCardList/>
      </div>
    </>
  )
}

