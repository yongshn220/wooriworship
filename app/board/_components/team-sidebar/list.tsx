import {TeamIconHint} from "@/components/team-icon-hint";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/option";
import {UserService} from "@/apis";
import {User} from "@/models/user";

export async function List() {
  const session = await getServerSession(authOptions)
  if (!session) {
    console.log("no session")
    return <></>
  }

  const user = await UserService.getById(session.user.id) as User
  if (!user) {
    console.log("no user")
    return <></>
  }
  console.log(user.teams)

  return (
    <>
      {
        user.teams.map((teamId: string) => (
          <TeamIconHint key={teamId} teamId={teamId}/>
        ))
      }
    </>
  )
}
