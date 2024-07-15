import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DirectionType} from "@/components/constants/enums";
import {worshipMultipleSheetsViewModeAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useRecoilState} from "recoil";


export function MultipleSheetsViewSelect() {
  const [mode, setMode] = useRecoilState(worshipMultipleSheetsViewModeAtom)

  return (
    <Select value={mode} onValueChange={(value) => setMode(value as DirectionType)}>
      <SelectTrigger className="flex-1 flex-end border-0 shadow-none" >
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={DirectionType.VERTICAL}>Vertical</SelectItem>
          <SelectItem value={DirectionType.HORIZONTAL}>Horizontal</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
