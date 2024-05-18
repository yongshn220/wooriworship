

export enum Routes {
  BOARD = "/board",
  PLAN = "/plan",
  SONG = "/song",
  EDIT = "/edit",
  WORSHIP = "/worship",
  WORSHIP_LIVE = "/live",
  HOME = "/"
}

export enum Page {
  BOARD,
  PLAN,
  SONG,
  WORSHIP,
  HONE,
}

export enum Param {
  TEAM_ID = "teamId"
}

export enum UserRole {
  Leader = 0,
  Member = 1
}

export enum Mode {
  EDIT,
  CREATE
}

export enum InvitationStatus {
  Pending = 0,
  Reject = 1,
  Accepted = 2
}

export enum DataFetchStatus {
  PROCESSING,
  VALID,
  INVALID
}
