import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorshipViewPageMode } from "@/components/constants/enums";
import { useRecoilState } from "recoil";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { worshipViewPageModeAtom } from "../_states/worship-detail-states";


export function WorshipViewPageModeSelect() {
    const [_, prefSetter] = useUserPreferences()
    const [mode, setMode] = useRecoilState(worshipViewPageModeAtom)

    function handleSetMode(mode: WorshipViewPageMode) {
        setMode(mode)
        prefSetter.worshipViewPageMode(mode)
    }

    return (
        <Select value={mode} onValueChange={(value) => handleSetMode(value as WorshipViewPageMode)}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 focus:ring-offset-0 ring-0 outline-none text-right justify-end px-0 font-medium text-foreground" >
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent className="z-[10004]">
                <SelectGroup>
                    <SelectItem value={WorshipViewPageMode.SINGLE_PAGE}>Single Page</SelectItem>
                    <SelectItem value={WorshipViewPageMode.DOUBLE_PAGE}>Double Page</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
