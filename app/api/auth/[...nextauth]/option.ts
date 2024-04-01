import {NextAuthOptions} from "@/node_modules/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {AuthService} from "@/apis";
import {User} from "@/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials: any) {
        const currentUser = await AuthService.login((credentials as any).email, (credentials as any).password)
        if (currentUser) {
          return currentUser
        }
        else {
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({session}): Promise<any> {
      if (!session || !session.user) return null
      const currentUser = await AuthService.getByEmail(session?.user?.email || "") as User
      session.user.id = currentUser?.id
      session.user.name = currentUser?.name
      session.user.email = currentUser?.email
      session.user.last_logged_time = currentUser?.last_logged_in_time
      session.user.created_time = currentUser?.created_time
      session.user.teams = currentUser?.teams

      return session
    },
  }
}
