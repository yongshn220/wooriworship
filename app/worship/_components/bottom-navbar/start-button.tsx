import {useRouter} from "next/navigation";
import {getPathWorshipView} from "@/components/helper/routes";
import PlayerPlayIcon from '@/public/icons/playerPlayIcon.svg'

interface Props {
  teamId: string,
  worshipId: string,
}

export function StartButton({teamId, worshipId}: Props) {
  const router = useRouter()

  function handleStartWorship() {
    router.push(getPathWorshipView(teamId, worshipId))
  }

  return (
    <div className="flex-center flex-col" onClick={handleStartWorship}>
      <PlayerPlayIcon/>
      <p className="text-sm">View</p>
    </div>
  )
}
