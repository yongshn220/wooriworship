import { Page } from "@/components/constants/enums";

export function getPathBoard() {
  return "/" + Page.BOARD
}

export function getPathHome(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}`
}

export function getPathNotice(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.NOTICE_BOARD
}

export function getPathCreateNotice(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.CREATE_NOTICE
}

export function getPathEditNotice(teamId: string, noticeId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.EDIT_NOTICE + `/${noticeId}`
}

// Legacy redirects (worship -> service)

export function getPathPlan(teamId: string) {
  return getPathServing(teamId);
}

export function getPathCreatePlan(teamId: string) {
  return getPathCreateServing(teamId);
}

export function getPathEditPlan(teamId: string, serviceId: string) {
  return getPathEditServing(teamId, serviceId);
}

export function getPathManage(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.MANAGE
}

export function getPathSong(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SONG_BOARD
}

export function getPathCreateSong(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.CREATE_SONG
}

export function getPathSongEdit(teamId: string, songId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.EDIT_SONG + `/${songId}`
}

export function getPathSongDetail(teamId: string, songId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SONG_BOARD + `/${songId}`
}

export function getPathServing(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SERVING
}

export function getPathService(teamId: string, serviceId: string) {
  // Redirect to Service Board
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.SERVING
}

export function getPathSetlistView(teamId: string, serviceId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/setlist-view" + `/${serviceId}`
}

export function getPathCreateServing(teamId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.CREATE_SERVING
}

export function getPathEditServing(teamId: string, serviceId: string) {
  return "/" + Page.BOARD + `/${teamId}` + "/" + Page.EDIT_SERVING + `/${serviceId}`
}
