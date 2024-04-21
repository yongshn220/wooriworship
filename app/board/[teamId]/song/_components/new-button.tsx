'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useSession} from "next-auth/react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Mode} from "@/components/constants/enums";

export function NewButton() {
  const {data: session} = useSession()
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtomById(teamId))
  const [isOpen, setIsOpen] = useState(false)



  /*async function handleViewSong() {
    const sampleUrl = '/ngAraLTxWKZCvsdc1zvO/주님의 마음 있는 곳[Bb].jpg'
    const url = await StorageService.downloadFile(sampleUrl);
    console.log(url);
    const imgElement = document.getElementById('image');
    if(imgElement != null)
      imgElement.setAttribute('src', String(url))
  }*/

  return (
    <div>
      <SongForm mode={Mode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} song={null}/>
      <Button onClick={() => setIsOpen(prev => !prev)}>
        Add Song
      </Button>
    </div>
  )
}
