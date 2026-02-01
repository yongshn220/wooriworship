import { atom } from "recoil";
import { SongBoardSortOption } from "@/components/constants/enums";
import type { TabKey } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-board-header";


export const songSearchInputAtom = atom<string>({
  key: 'songSearchInputAtom',
  default: '',
});

export const planSearchInputAtom = atom<string>({
  key: 'planSearchInputAtom',
  default: '',
});

export const noticeBoardTabAtom = atom<TabKey>({
  key: 'noticeBoardTabAtom',
  default: 'announcements',
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