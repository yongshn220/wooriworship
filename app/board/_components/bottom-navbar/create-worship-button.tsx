import {useRecoilValue} from "recoil";
import {LayoutDashboard} from "lucide-react";
import {useRouter} from "next/navigation";
import {getPathCreatePlan} from "@/components/helper/routes";
import {currentTeamIdAtom} from "@/global-states/teamState";

export function CreateWorshipButton() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  function handleClick() {
    router.push(getPathCreatePlan(teamId))
  }

  return (
    <div className="flex-center flex-col space-y-1 cursor-pointer" onClick={handleClick}>
      <div className="flex-center w-20 h-20 bg-gray-300 rounded-lg">
        <LayoutDashboard/>
      </div>
      <p className="text-sm">Worship</p>
    </div>
  )
}
