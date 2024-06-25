

export enum Routes {
  BOARD = "/board",
  PLAN = "/plan",
  SONG = "/song",
  MANAGE_TEAM = "/manage-team",
  EDIT = "/edit",
  WORSHIP = "/worship",
  WORSHIP_LIVE = "/live",
  HOME = "/"
}

export enum Page {
  BOARD,
  PLAN,
  SONG,
  MANAGE_TEAM,
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

export enum FormMode {
  EDIT,
  CREATE
}

export enum InvitationStatus {
  Pending = 0,
  Rejected = 1,
  Accepted = 2
}

export enum DataFetchStatus {
  PROCESSING,
  VALID,
  INVALID
}


export enum ResetType {
  ALL
}
