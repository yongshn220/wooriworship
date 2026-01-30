import useLocalStorage from "@/components/util/hook/use-local-storage";
import {DirectionType, SetlistViewPageMode} from "@/components/constants/enums";

interface Preference {
  board: BoardPreference
  setlistLive: SetlistLivePreference
}

interface SetlistLivePreference {
  showSongNote: boolean
  showSongNumber: boolean
  multipleSheetsView: DirectionType
  pageMode: SetlistViewPageMode
}
interface BoardPreference {
  selectedTeamId: string
}

type PreferenceSetter = {
  (): void
  boardSelectedTeamId: (teamId: string) => void
  setlistLiveShowSongNote: (showSongNote: boolean) => void
  setlistLiveShowSongNumber: (showSongNumber: boolean) => void
  setlistLiveMultipleSheetsView: (viewMode: DirectionType) => void
  setlistViewPageMode: (pageMode: SetlistViewPageMode) => void
}

const DEFAULT_SETLIST_LIVE: SetlistLivePreference = {
  showSongNote: true,
  showSongNumber: true,
  multipleSheetsView: DirectionType.VERTICAL,
  pageMode: SetlistViewPageMode.SINGLE_PAGE,
}

export default function useUserPreferences(): [Preference, PreferenceSetter] {
  const [rawPreferences, setPreferences] = useLocalStorage<Preference & { worshipLive?: SetlistLivePreference }>('userPreferences', {
    board: {
      selectedTeamId: "",
    },
    setlistLive: DEFAULT_SETLIST_LIVE,
  });

  // Migrate legacy "worshipLive" → "setlistLive"
  const preferences: Preference = {
    ...rawPreferences,
    setlistLive: rawPreferences.setlistLive ?? rawPreferences.worshipLive ?? DEFAULT_SETLIST_LIVE,
  };

  const setter: PreferenceSetter = Object.assign(
    () => {},
    {
      boardSelectedTeamId: (teamId: string) => {
        setPreferences((prev) => ({...prev, board: {...prev.board, selectedTeamId: teamId}}))
      },
      setlistLiveShowSongNote: (showSongNote: boolean) => {
        setPreferences((prev) => ({...prev, setlistLive: {...prev.setlistLive, showSongNote}}));
      },
      setlistLiveShowSongNumber: (showSongNumber: boolean) => {
        setPreferences((prev) => ({...prev, setlistLive: {...prev.setlistLive, showSongNumber}}));
      },
      setlistLiveMultipleSheetsView: (viewMode: DirectionType) => {
        setPreferences((prev) => ({...prev, setlistLive: {...prev.setlistLive, multipleSheetsView: viewMode}}));
      },
      setlistViewPageMode: (pageMode: SetlistViewPageMode) => {
        setPreferences((prev) =>({...prev, setlistLive: {...prev.setlistLive, pageMode: pageMode}}));
      }
    }
  )

  return [preferences, setter];
}
