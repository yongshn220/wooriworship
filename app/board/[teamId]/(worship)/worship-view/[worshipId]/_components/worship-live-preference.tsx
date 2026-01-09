import useUserPreferences from "@/components/util/hook/use-local-preference";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { worshipLiveOptionsAtom, worshipMultipleSheetsViewModeAtom, worshipViewPageModeAtom } from "../_states/worship-detail-states";
import { WorshipViewPageMode } from "@/components/constants/enums";


export function WorshipLivePreference() {
    const [preferences, _] = useUserPreferences()
    const setWorshipLiveOptions = useSetRecoilState(worshipLiveOptionsAtom)
    const setMultipleSheetsView = useSetRecoilState(worshipMultipleSheetsViewModeAtom)
    const setPageMode = useSetRecoilState(worshipViewPageModeAtom)

    useEffect(() => {
        setWorshipLiveOptions({
            showSongNote: preferences.worshipLive.showSongNote ?? true,
            showSongNumber: preferences.worshipLive.showSongNumber ?? true
        })
        setMultipleSheetsView(preferences.worshipLive.multipleSheetsView)
        setPageMode(preferences.worshipLive.pageMode ?? WorshipViewPageMode.SINGLE_PAGE)
    }, [preferences.worshipLive, setWorshipLiveOptions, setMultipleSheetsView, setPageMode]);


    return <></>
}
