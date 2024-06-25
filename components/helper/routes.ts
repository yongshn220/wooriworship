import {Routes} from "@/components/constants/enums";

export function getPathBoard() {
  return Routes.BOARD
}

export function getPathPlan(teamId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.PLAN
}

export function getPathManagePlan(teamId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.MANAGE_TEAM
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

export function getPathWorshipEdit(teamId: string, worshipId: string) {
  return Routes.BOARD + `/${teamId}` + Routes.PLAN + `/${worshipId}` + Routes.EDIT
}

export function getPathWorshipStartMode(teamId: string, worshipId: string) {
  return Routes.WORSHIP + `/${teamId}` + `/${worshipId}` + Routes.WORSHIP_LIVE
}
