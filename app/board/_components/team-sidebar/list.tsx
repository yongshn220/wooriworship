import {TeamIconHint} from "@/components/team-icon-hint";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/option";

export async function List() {
  const session = await getServerSession(authOptions)
  if (!session) return <></>

  console.log(session.user.teams)
  return (
    <>
      {
        session.user.teams.map((teamId: string) => (
          <TeamIconHint key={teamId} teamId={teamId}/>
        ))
      }
    </>
  )
}
