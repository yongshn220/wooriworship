import { atom, atomFamily, selectorFamily } from "recoil";
import { UserApi } from "@/apis";
import { User } from "@/models/user";


export const userAtom = atomFamily<User, string>({
  key: "userAtom",
  default: selectorFamily({
    key: "userAtom/default",
    get: (userId: string) => async ({ get }) => {
      get(userUpdaterAtom)
      try {
        if (!userId) return null

        const user = await UserApi.getById(userId) as User
        if (!user) return null

        return user
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})

export const usersAtom = atomFamily<Array<User>, Array<string>>({
  key: 'usersAtom',
  default: selectorFamily({
    key: 'usersAtom/default',
    get: (userIds: Array<string>) => async ({ get }) => {
      get(userUpdaterAtom); // Enable refresh trigger
      if (!userIds || userIds.length === 0) return []

      try {
        const users = await UserApi.getByIds([...userIds]) as Array<User>;
        return users || [];
      } catch (e) {
        console.error(e);
        return [];
      }
    }
  })
});

export const userUpdaterAtom = atom({
  key: "userUpdaterAtom",
  default: 0
})
