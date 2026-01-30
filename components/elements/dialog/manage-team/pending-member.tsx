import Image from "next/image";
import { Invitation } from "@/models/invitation";
import { InvitationApi } from "@/apis";
import { InvitationStatus } from "@/components/constants/enums";
import { toast } from "@/components/ui/use-toast";
import { sentInvitationsUpdaterAtom } from "@/global-states/invitation-state";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSetRecoilState } from "recoil";

interface Props {
  invitation: Invitation
}

export function PendingMember({ invitation }: Props) {
  const sentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)

  async function handleRemoveInvitation() {
    if (await InvitationApi.delete(invitation.id) === false) {
      toast({ title: "Something went wrong. Please try again later." })
      return;
    }

    /* on success */
    sentInvitationsUpdater(prev => prev + 1)
    toast({ title: "You have successfully remove the invitation" })
  }

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-dashed">
          <Image alt="user" src="/icons/userIcon.svg" width={16} height={16} className="opacity-40 grayscale" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate text-muted-foreground/80">
            {invitation?.receiver_email}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
            Pending Invitation
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="min-h-touch min-w-touch h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={handleRemoveInvitation}
      >
        <span className="sr-only">Remove</span>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
