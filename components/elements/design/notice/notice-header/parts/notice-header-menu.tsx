import { getPathEditNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { noticeUpdaterAtom, noticeIdsUpdaterAtom } from "@/global-states/notice-state";
import { NoticeApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { EntityMenu } from "@/components/common/menu/entity-menu";

interface Props {
  noticeId: string
  createdById: string
}

export function NoticeHeaderMenu({ noticeId, createdById }: Props) {
  const [user] = useAuthState(auth as any);
  const teamId = useRecoilValue(currentTeamIdAtom)
  useSetRecoilState(noticeUpdaterAtom)
  const setNoticeIdsUpdater = useSetRecoilState(noticeIdsUpdaterAtom)
  const router = useRouter()

  if (!user || user.uid !== createdById) return null;

  const handleEdit = () => {
    router.push(getPathEditNotice(teamId, noticeId));
  };

  const handleDelete = async () => {
    try {
      await NoticeApi.deleteNotice(teamId, noticeId);
      toast({
        title: "Notice deleted",
        description: "The notice has been successfully deleted.",
      });
      setNoticeIdsUpdater((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notice.",
      });
    }
  };

  return (
    <EntityMenu
      onEdit={handleEdit}
      onDelete={handleDelete}
      deleteConfig={{
        title: "Delete Notice?",
        description: "This action cannot be undone. This will permanently delete the notice and remove associated files from our servers.",
      }}
      modal={false}
      className="text-muted-foreground/50 hover:text-muted-foreground"
      testId="notice-menu"
    />
  )
}
