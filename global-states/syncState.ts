import {atom} from "recoil";

export enum FirebaseSyncStatus {
  NOT_SYNCED ,
  PROCESSING,
  SYNCED,
}

export const firebaseSyncStatusAtom = atom<FirebaseSyncStatus>({
  key: "firebaseSyncStatusAtom",
  default: FirebaseSyncStatus.NOT_SYNCED
})
