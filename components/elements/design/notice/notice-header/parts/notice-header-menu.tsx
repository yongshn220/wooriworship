import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SquarePen, Trash2, EllipsisVertical } from "lucide-react";
import { getPathEditNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useState } from "react";
import { noticeUpdaterAtom, noticeIdsUpdaterAtom } from "@/global-states/notice-state";
import { NoticeApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!user || user.uid !== createdById) return null;

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
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none" data-testid="notice-menu">
            <EllipsisVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onClick={() => router.push(getPathEditNotice(teamId, noticeId))}
            data-testid="notice-edit"
          >
            Edit
            <SquarePen className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
            onClick={() => setIsDeleteDialogOpen(true)}
            data-testid="notice-delete"
          >
            Delete
            <Trash2 className="w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        title="Delete Notice?"
        description="This action cannot be undone. This will permanently delete the notice and remove associated files from our servers."
        onDeleteHandler={handleDelete}
      />
    </>
  )
}
