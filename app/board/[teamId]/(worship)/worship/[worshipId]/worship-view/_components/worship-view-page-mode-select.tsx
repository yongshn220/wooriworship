import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DirectionType, WorshipViewPageMode} from "@/components/constants/enums";
import {useRecoilState} from "recoil";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import {worshipViewPageModeAtom} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_states/worship-detail-states";


export function WorshipViewPageModeSelect() {
  const [_, prefSetter] = useUserPreferences()
  const [mode, setMode] = useRecoilState(worshipViewPageModeAtom)

  function handleSetMode(mode: WorshipViewPageMode) {
    setMode(mode)
    prefSetter.worshipViewPageMode(mode)
  }

  return (
    <Select value={mode} onValueChange={(value) => handleSetMode(value as WorshipViewPageMode)}>
      <SelectTrigger className="flex-1 flex-end border-0 shadow-none" >
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={WorshipViewPageMode.SINGLE_PAGE}>Single Page</SelectItem>
          <SelectItem value={WorshipViewPageMode.DOUBLE_PAGE}>Double Page</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
