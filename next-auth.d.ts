import { DefaultSession, Profile } from "next-auth"
import {MajorType} from "@components/constants/values";

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      teams: Array<string>
      last_logged_time: Date
      created_time: Date
    } & DefaultSession["user"]
  }

  interface Profile {
    picture: string
  }
}
