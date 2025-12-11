import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DirectionType } from "@/components/constants/enums";
import { useRecoilState } from "recoil";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { worshipMultipleSheetsViewModeAtom } from "../_states/worship-detail-states";


export function MultipleSheetsViewSelect() {
    const [_, prefSetter] = useUserPreferences()
    const [mode, setMode] = useRecoilState(worshipMultipleSheetsViewModeAtom)

    function handleSetMode(mode: DirectionType) {
        setMode(mode)
        prefSetter.worshipLiveMultipleSheetsView(mode)
    }

    return (
        <Select value={mode} onValueChange={(value) => handleSetMode(value as DirectionType)}>
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
