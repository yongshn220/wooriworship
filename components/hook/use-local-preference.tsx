import useLocalStorage from "@/components/hook/use-local-storage";

interface Preference {
  board: BoardPreference
  worshipLive: WorshipLivePreference
}

interface WorshipLivePreference {
  showSongNote: boolean
  showSongNumber: boolean
}
interface BoardPreference {
  selectedTeamId: string
}


export default function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<Preference>('userPreferences', {
    board: {
      selectedTeamId: "",
    },
    worshipLive: {
      showSongNote: true,
      showSongNumber: true,
    },
  });

  return [preferences, setPreferences as Function];
}
