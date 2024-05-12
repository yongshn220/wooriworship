import BaseService from "./BaseService"
import { User } from "@/models/user";
import {arrayUnion} from "@firebase/firestore";

class UserService extends BaseService {
    constructor() {
        super("users");
    }

    async addNewUser(userId: string, email: string, name: string) {
        const user = {
            name: name,
            email: email,
            created_time: new Date(),
            last_logged_in_time: new Date(),
            teams: [] as Array<string>,
            invite_optin: true
        }
        await this.update(userId, user);
        return {...user, id: userId}
    }

    async addNewTeam(userId: string, teamId: string) {
        if (userId) {
            await this.update(userId, {teams: arrayUnion(teamId)});
            return teamId;
        } else {
            console.log("there is no currentUser")
            return null;
        }
    }

    async updateInviteOptin(userId: string, inviteOptin: Boolean) {
        this.update(userId, {invite_optin: inviteOptin})
    }
}
export default new UserService();
