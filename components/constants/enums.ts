

export enum Routes {
  BOARD = "board",
  NOTICE = "notice",
  PLAN = "plan",
  SONG = "song",
  CREATE_SONG = "create-song",
  EDIT_SONG = "edit-song",
  CREATE_PLAN = "create-plan",
  EDIT_PLAN = "edit-plan",
  EDIT = "edit",
  MANAGE_TEAM = "manage-team",
  WORSHIP = "worship",
  WORSHIP_LIVE = "live",
}

export enum Page {
  BOARD = "board",
  HOME = "home",
  NOTICE = "notice",
  PLAN = "plan",
  SONG = "song",
  CREATE_SONG = "create-song",
  EDIT_SONG = "edit-song",
  CREATE_PLAN = "create-plan",
  EDIT_PLAN = "edit-plan",
  MANAGE_TEAM = "manage-team",
  WORSHIP = "worship",
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

export enum SongBoardSortOption {
  NONE,
  TITLE_ASCENDING,
  TITLE_DESCENDING,
  LAST_USED_DATE_ASCENDING,
  LAST_USED_DATE_DESCENDING,
}

export enum DirectionType {
  VERTICAL = "Vertical",
  HORIZONTAL = "Horizontal"
}

/* Worship Plan */
export enum WorshipSpecialOrderType {
  BEGINNING="beginning",
  ENDING="ending",
}
