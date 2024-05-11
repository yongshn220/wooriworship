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

export const firebaseAuthUserAtom = atom<any>({
  key: "firebaseAuthUserAtom",
  default: null
})
