import { atom } from "recoil";
import { SongBoardSortOption } from "@/components/constants/enums";


export const songSearchInputAtom = atom<string>({
  key: 'songSearchInputAtom',
  default: '',
});

export const planSearchInputAtom = atom<string>({
  key: 'planSearchInputAtom',
  default: '',
});

export const headerActionsAtom = atom<React.ReactNode | null>({
  key: 'headerActionsAtom',
  default: null,
});

export const searchSelectedTagsAtom = atom<Array<string>>({
  key: "searchSelectedTagsAtom",
  default: []
})

export const searchSelectedKeysAtom = atom<Array<string>>({
  key: "searchSelectedKeysAtom",
  default: []
})

export const songBoardSelectedSortOptionAtom = atom<SongBoardSortOption>({
  key: "songBoardSelectedSortOptionAtom",
  default: SongBoardSortOption.TITLE_ASCENDING,
})