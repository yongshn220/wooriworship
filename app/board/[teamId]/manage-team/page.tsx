import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {ManageTeamContent} from "@/app/board/_components/nav-bar/manage-team-content";


export default function ManageTeam({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col">
      <PageInit teamId={teamId} page={Page.MANAGE_TEAM}/>
      <ManageTeamContent/>
    </div>
  )
}
