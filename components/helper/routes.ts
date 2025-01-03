import {Page} from "@/components/constants/enums";

export function getPathBoard() {
  return "/" + Page.BOARD
}

export function getPathHome(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}`
}

export function getPathNotice(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.NOTICE
}

export function getPathPlan(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.PLAN
}

export function getPathCreatePlan(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.CREATE_PLAN
}

export function getPathEditPlan(teamId: string, worshipId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.EDIT_PLAN + `/${worshipId}`
}

export function getPathManageTeam(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.MANAGE_TEAM
}

export function getPathManage(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.MANAGE
}

export function getPathSong(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SONG
}

export function getPathCreateSong(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.CREATE_SONG
}

export function getPathSongEdit(teamId: string, songId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.EDIT_SONG + `/${songId}`
}

export function getPathSongDetail(teamId: string, songId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SONG + `/${songId}`
}

export function getPathWorship(teamId: string, worshipId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.WORSHIP + `/${worshipId}`
}

export function getPathWorshipView(teamId: string, worshipId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.WORSHIP + `/${worshipId}` + "/" + Page.WORSHIP_VIEW
}
