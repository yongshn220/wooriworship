"use client"
import { useRouter } from "next/navigation";
import { getPathSong, getPathSongEdit } from "@/components/util/helper/routes";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { SongApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { songAtom, songUpdaterAtom } from "@/global-states/song-state";
import { downloadMultipleMusicSheets } from "@/components/util/helper/helper-functions";
import { EntityMenu } from "@/components/common/menu/entity-menu";

interface Props {
  teamId: string
  songTitle: string
  songId: string
  readOnly?: boolean
}

export function SongDetailMenuButton({ teamId, songTitle, songId, readOnly = false }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))
  const setSongUpdater = useSetRecoilState(songUpdaterAtom)
  const router = useRouter()

  async function handleEditSong() {
    router.push(getPathSongEdit(teamId, songId))
  }

  async function handleDeleteSong() {
    try {
      const isSuccess = await SongApi.deleteSong(teamId, songId)
      if (isSuccess) {
        setSongUpdater((prev) => prev + 1)
        toast({ title: "Song deleted successfully", description: "" })
        router.replace(getPathSong(teamId))
      }
      else {
        toast({ title: "Fail to delete song-board", description: "Something went wrong. Please try again later." })
      }
    }
    catch (e) {
      console.log(e)
      toast({ title: "Fail to delete song-board", description: "Something went wrong. Please try again later." })
    }
  }

  async function handleDownloadSong() {
    await downloadMultipleMusicSheets([song])
  }

  return (
    <EntityMenu
      onEdit={handleEditSong}
      onDelete={readOnly ? undefined : handleDeleteSong}
      onDownload={handleDownloadSong}
      deleteConfig={{
        title: "Delete Song",
        description: `Do you really want to delete [${songTitle}]? This action can't be undone.`,
      }}
      downloadLabel="Download Score"
      modal={true}
      testId="song-menu"
    />
  )
}
