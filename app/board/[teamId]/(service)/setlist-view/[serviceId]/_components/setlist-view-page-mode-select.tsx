import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SetlistViewPageMode } from "@/components/constants/enums";
import { useRecoilState } from "recoil";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { setlistViewPageModeAtom } from "../_states/setlist-view-states";


export function SetlistViewPageModeSelect() {
    const [_, prefSetter] = useUserPreferences()
    const [mode, setMode] = useRecoilState(setlistViewPageModeAtom)

    function handleSetMode(mode: SetlistViewPageMode) {
        setMode(mode)
        prefSetter.setlistViewPageMode(mode)
    }

    return (
        <Select value={mode} onValueChange={(value) => handleSetMode(value as SetlistViewPageMode)}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 focus:ring-offset-0 ring-0 outline-none text-right justify-end px-0 font-medium text-foreground" >
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent className="z-[10004]">
                <SelectGroup>
                    <SelectItem value={SetlistViewPageMode.SINGLE_PAGE}>Single Page</SelectItem>
                    <SelectItem value={SetlistViewPageMode.DOUBLE_PAGE}>Double Page</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
