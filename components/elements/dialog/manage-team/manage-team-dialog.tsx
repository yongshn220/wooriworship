import { ManageTeamContent } from "@/components/elements/dialog/manage-team/manage-team-content";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Suspense } from "react";


export function ManageTeamDialog({ children }: any) {

  return (
    <ResponsiveDrawer trigger={<div className="w-full">{children}</div>}>
      <Suspense fallback={<div></div>}>
        <ManageTeamContent />
      </Suspense>
    </ResponsiveDrawer>
  )
}
