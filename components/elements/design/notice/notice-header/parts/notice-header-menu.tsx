import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2Icon, MoreHorizontal } from "lucide-react";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="min-h-touch min-w-touch h-11 w-11 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20" data-testid="notice-menu">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer pl-2" onClick={() => router.push(getPathEditNotice(teamId, noticeId))} data-testid="notice-edit">
              <SquarePen className="mr-3 w-5 h-5" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer pl-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
              data-testid="notice-delete"
            >
              <Trash2Icon className="mr-3 w-5 h-5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
