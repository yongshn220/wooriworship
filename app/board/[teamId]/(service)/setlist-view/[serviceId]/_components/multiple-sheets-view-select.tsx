import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DirectionType } from "@/components/constants/enums";
import { useRecoilState } from "recoil";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { setlistMultipleSheetsViewModeAtom } from "../_states/setlist-view-states";


export function MultipleSheetsViewSelect() {
    const [_, prefSetter] = useUserPreferences()
    const [mode, setMode] = useRecoilState(setlistMultipleSheetsViewModeAtom)

    function handleSetMode(mode: DirectionType) {
        setMode(mode)
        prefSetter.setlistLiveMultipleSheetsView(mode)
    }

    return (
        <Select value={mode} onValueChange={(value) => handleSetMode(value as DirectionType)}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 focus:ring-offset-0 ring-0 outline-none text-right justify-end px-0 font-medium text-foreground" >
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent className="z-1200">
                <SelectGroup>
                    <SelectItem value={DirectionType.VERTICAL}>Vertical</SelectItem>
                    <SelectItem value={DirectionType.HORIZONTAL}>Horizontal</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
