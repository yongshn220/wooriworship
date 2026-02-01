
export enum Page {
  BOARD = "board",
  HOME = "home",
  NOTICE_BOARD = "notice-board",
  CREATE_NOTICE = "create-notice",
  EDIT_NOTICE = "edit-notice",
  WORSHIP_BOARD = "worship-board",
  WORSHIP = "worship",
  WORSHIP_VIEW = "worship-view",
  CREATE_WORSHIP = "create-worship",
  EDIT_WORSHIP = "edit-worship",
  SONG_BOARD = "song-board",
  CREATE_SONG = "create-song",
  EDIT_SONG = "edit-song",
  SERVING = "service-board",
  CREATE_SERVING = "create-service", // Route renamed: create-serving → create-service
  EDIT_SERVING = "edit-service", // Route renamed: edit-serving → edit-service
  MANAGE = "manage",
  MANAGE_SUBPAGE = "manage-subpage",
  TODO_BOARD = "todo-board",
}


export enum UserRole {
  Leader = 0,
  Member = 1
}

export enum FormMode {
  EDIT = "EDIT",
  CREATE = "CREATE"
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
  HORIZONTAL = "Horizontal",
}

export enum SetlistViewPageMode {
  SINGLE_PAGE = "singlePage",
  DOUBLE_PAGE = "doublePage",
}

/* Setlist */
export enum SetlistSpecialOrderType {
  BEGINNING = "beginning",
  ENDING = "ending",
}
