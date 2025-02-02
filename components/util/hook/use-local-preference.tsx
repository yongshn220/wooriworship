import useLocalStorage from "@/components/util/hook/use-local-storage";
import {DirectionType, WorshipViewPageMode} from "@/components/constants/enums";

interface Preference {
  board: BoardPreference
  worshipLive: WorshipLivePreference
}

interface WorshipLivePreference {
  showSongNote: boolean
  showSongNumber: boolean
  multipleSheetsView: DirectionType
  pageMode: WorshipViewPageMode
}
interface BoardPreference {
  selectedTeamId: string
}

type PreferenceSetter = {
  (): void
  boardSelectedTeamId: (teamId: string) => void
  worshipLiveShowSongNote: (showSongNote: boolean) => void
  worshipLiveShowSongNumber: (showSongNumber: boolean) => void
  worshipLiveMultipleSheetsView: (viewMode: DirectionType) => void
  worshipViewPageMode: (pageMode: WorshipViewPageMode) => void
}

export default function useUserPreferences(): [Preference, PreferenceSetter] {
  const [preferences, setPreferences] = useLocalStorage<Preference>('userPreferences', {
    board: {
      selectedTeamId: "",
    },
    worshipLive: {
      showSongNote: true,
      showSongNumber: true,
      multipleSheetsView: DirectionType.VERTICAL,
      pageMode: WorshipViewPageMode.SINGLE_PAGE,
    },
  });

  const setter: PreferenceSetter = Object.assign(
    () => {},
    {
      boardSelectedTeamId: (teamId: string) => {
        setPreferences((prev) => ({...prev, board: {...prev.board, selectedTeamId: teamId}}))
      },
      worshipLiveShowSongNote: (showSongNote: boolean) => {
        setPreferences((prev) => ({...prev, worshipLive: {...prev.worshipLive, showSongNote}}));
      },
      worshipLiveShowSongNumber: (showSongNumber: boolean) => {
        setPreferences((prev) => ({...prev, worshipLive: {...prev.worshipLive, showSongNumber}}));
      },
      worshipLiveMultipleSheetsView: (viewMode: DirectionType) => {
        setPreferences((prev) => ({...prev, worshipLive: {...prev.worshipLive, multipleSheetsView: viewMode}}));
      },
      worshipViewPageMode: (pageMode: WorshipViewPageMode) => {
        setPreferences((prev) =>({...prev, worshipLive: {...prev.worshipLive, pageMode: pageMode}}));
      }
    }
  )

  return [preferences, setter];
}
