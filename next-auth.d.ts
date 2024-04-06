import { DefaultSession, Profile } from "next-auth"
import {MajorType} from "@components/constants/values";
import {User} from "@/models/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string,
    },
    firebaseToken: string
  }

  interface Profile {
    picture: string
  }
}
