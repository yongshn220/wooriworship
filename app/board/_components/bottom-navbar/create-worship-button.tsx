import {useState} from "react";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {FormMode} from "@/components/constants/enums";
import {LayoutDashboard} from "lucide-react";

export function CreateWorshipButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setSelectedSongInfoList = useSetRecoilState(selectedSongInfoListAtom)

  function handleClick() {
    setSelectedSongInfoList([])
    setIsOpen(true)
  }

  return (
    <>
      <WorshipForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} worship={null}/>
      <div className="flex-center flex-col space-y-1 cursor-pointer" onClick={handleClick}>
        <div className="flex-center w-20 h-20 bg-gray-300 rounded-lg">
          <LayoutDashboard/>
        </div>
        <p className="text-sm">Worship</p>
      </div>
    </>
  )
}
