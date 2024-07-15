import useLocalStorage from "@/components/hook/use-local-storage";
import {DirectionType} from "@/components/constants/enums";

interface Preference {
  board: BoardPreference
  worshipLive: WorshipLivePreference
}

interface WorshipLivePreference {
  showSongNote: boolean
  showSongNumber: boolean
  multipleSheetsView: DirectionType
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
}

export default function useUserPreferences(): [Preference, PreferenceSetter] {
  const [preferences, setPreferences] = useLocalStorage<Preference>('userPreferences', {
    board: {
      selectedTeamId: "",
    },
    worshipLive: {
      showSongNote: true,
      showSongNumber: true,
      multipleSheetsView: DirectionType.VERTICAL
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
      }
    }
  )

  return [preferences, setter];
}
