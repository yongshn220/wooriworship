
import {Team} from "@/models/team";
import {TeamIconHint} from "@/components/team-icon-hint";
import {TeamService} from "@/apis"
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/option";

export async function List() {
  const session = await getServerSession(authOptions)
  if (!session) return <></>

  const teams = await TeamService.getByIds([...session.user.teams])

  return (
    <>
      {
        teams.map((team: Team) => (
          <TeamIconHint key={team.id} team={team}/>
        ))
      }
    </>
  )
}
