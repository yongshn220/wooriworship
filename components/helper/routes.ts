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

export function getPathSongDetail(teamId: string, songId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.SONG + `/${songId}`
}

export function getPathSongEdit(teamId: string, songId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.SONG + `/${songId}` + Routes.EDIT
}

export function getPathWorship(teamId: string, worshipId: string) {
  return Routes.WORSHIP + `/${teamId}` + `/${worshipId}`
}
