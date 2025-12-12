import BaseService from "./BaseService"
import { arrayUnion, arrayRemove } from "@firebase/firestore";
import TeamService from "./TeamService";

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
            invite_optin: true,
            email_verified: false
        }
        await this.update(userId, user);
        return { ...user, id: userId }
    }

    async addNewTeam(userId: string, teamId: string) {
        if (userId) {
            await this.update(userId, { teams: arrayUnion(teamId) });
            return teamId;
        } else {
            console.log("there is no currentUser")
            return null;
        }
    }

    async updateInviteOptin(userId: string, inviteOptin: Boolean) {
        await this.update(userId, { invite_optin: inviteOptin })
    }

    async subscribePushNotification() {

    }



    async leaveTeam(userId: string, teamId: string, singleSide: Boolean) {
        if (userId && teamId) {
            if (!singleSide) {
                await TeamService.removeMember(userId, teamId, true);
            }
            await this.update(userId, { teams: arrayRemove(teamId) });
            return teamId;
        } else {
            console.log("user id or team id is missing");
            return false;
        }
    }
}
export default new UserService();
