import useUserPreferences from "@/components/util/hook/use-local-preference";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { setlistLiveOptionsAtom, setlistMultipleSheetsViewModeAtom, setlistViewPageModeAtom } from "../_states/setlist-view-states";
import { SetlistViewPageMode } from "@/components/constants/enums";


export function SetlistLivePreference() {
    const [preferences, _] = useUserPreferences()
    const setSetlistLiveOptions = useSetRecoilState(setlistLiveOptionsAtom)
    const setMultipleSheetsView = useSetRecoilState(setlistMultipleSheetsViewModeAtom)
    const setPageMode = useSetRecoilState(setlistViewPageModeAtom)

    useEffect(() => {
        setSetlistLiveOptions({
            showSongNote: preferences.setlistLive.showSongNote ?? true,
            showSongNumber: preferences.setlistLive.showSongNumber ?? true
        })
        setMultipleSheetsView(preferences.setlistLive.multipleSheetsView)
        setPageMode(preferences.setlistLive.pageMode ?? SetlistViewPageMode.SINGLE_PAGE)
    }, [preferences.setlistLive, setSetlistLiveOptions, setMultipleSheetsView, setPageMode]);


    return <></>
}
