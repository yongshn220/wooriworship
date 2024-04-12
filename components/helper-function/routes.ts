import {Routes} from "@/components/constants/enums";

export function getPathBoard() {
  return Routes.BOARD
}

export function getPathPlan(teamId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.PLAN
}

export function getPathSong(teamId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.SONG
}
