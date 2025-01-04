import useUserPreferences from "@/components/hook/use-local-preference";
import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {worshipLiveOptionsAtom, worshipMultipleSheetsViewModeAtom} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_states/worship-detail-states";


export function WorshipLivePreference() {
  const [preferences, _] = useUserPreferences()
  const setWorshipLiveOptions = useSetRecoilState(worshipLiveOptionsAtom)
  const setMultipleSheetsView = useSetRecoilState(worshipMultipleSheetsViewModeAtom)

  useEffect(() => {
    setWorshipLiveOptions({
      showSongNote: preferences.worshipLive.showSongNote,
      showSongNumber: preferences.worshipLive.showSongNumber
    })
    setMultipleSheetsView(preferences.worshipLive.multipleSheetsView)
  }, [preferences.worshipLive, setWorshipLiveOptions, setMultipleSheetsView]);


  return <></>
}
