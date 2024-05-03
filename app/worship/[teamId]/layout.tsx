import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";


export default function WorshipInitLayout({params, children}: any) {
  const teamId = params.teamId
  return (
    <div>
      <PageInit teamId={teamId} page={Page.WORSHIP}/>
      {children}
    </div>
  )
}
