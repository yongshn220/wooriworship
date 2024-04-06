import {NextAuthOptions} from "@/node_modules/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {auth} from "@/firebase";
import {FirestoreAdapter} from "@auth/firebase-adapter";
import {adminAuth, adminDB} from "@/firebase-admin";
import {Adapter} from "next-auth/adapters";
import AuthService from "@/apis/AuthService";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials: any): Promise<any> {
        return await AuthService.loginTemp(credentials.email, credentials.password)
      }
    })
  ],
  callbacks: {
    async jwt({token, user}: any) {
      if (user) {
        token.sub = user.id
      }
      return token
    },

    async session({session, token}): Promise<any> {
      if (!session || !session.user || !token.sub) return null

      const firebaseToken = await adminAuth.createCustomToken(token.sub)
      const currentUser = await UserService.getById(token.sub) as User;

      session.firebaseToken = firebaseToken
      session.user.id = currentUser?.id
      session.user.name = currentUser?.name
      session.user.email = currentUser?.email
      session.user.last_logged_in_time = currentUser?.last_logged_in_time
      session.user.created_time = currentUser?.created_time
      session.user.teams = currentUser?.teams

      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: FirestoreAdapter(adminDB) as Adapter
}
