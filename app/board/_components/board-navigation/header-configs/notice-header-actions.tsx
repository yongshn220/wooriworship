"use client";

import { useRecoilValue } from "recoil";
import { noticeBoardTabAtom } from "@/app/board/_states/board-states";
import { CreateActionButton } from "@/app/board/_components/board-navigation/create-action-button";
import { getPathCreateNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";

interface NoticeHeaderActionsProps {
  teamId: string;
}

export function NoticeHeaderActions({ teamId }: NoticeHeaderActionsProps) {
  const tab = useRecoilValue(noticeBoardTabAtom);
  const router = useRouter();

  if (tab !== "announcements") return null;

  return <CreateActionButton onClick={() => router.push(getPathCreateNotice(teamId))} />;
}
