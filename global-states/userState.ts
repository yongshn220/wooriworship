import {atom, atomFamily, selectorFamily} from "recoil";
import {UserService} from "@/apis";
import {User} from "@/models/user";


export const userAtom = atomFamily<User, string>({
  key: "userAtom",
  default: selectorFamily({
    key: "userAtom/default",
    get: (userId: string) => async ({get}) => {
      get(userUpdaterAtom)
      try {
        if (!userId) return null

        const user = await UserService.getById(userId) as User
        if (!user) return null

        return user
      }
      catch (e) {
        console.log(e)
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
      if (!userIds) return []

      const users = await Promise.all(userIds.map(async userId => {
        return get(userAtom(userId));
      }));

      return users.filter(user => user !== null) as Array<User>;
    }
  })
});

export const userUpdaterAtom = atom({
  key: "userUpdaterAtom",
  default: 0
})
