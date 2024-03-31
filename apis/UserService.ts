import BaseService from "./BaseService"
import { User } from "@/models/user";

class UserService extends BaseService {
    constructor() {
        super("users");
    }

    async addNewUser(userId: string, email: string, name: string) {
        const user = {
            name: name,
            email: email,
            created_time: new Date(),
            last_logged_time: new Date(),
            teams: []
        }
        await this.update(userId, user);
        return {...user, id: userId}
    }

    async addNewTeam(user: User, teamId: string) {
        if(user) {
            await this.update(user.id, {teams: [...user.teams, teamId]});
            return teamId;
        } else {
            console.log("there is no currentUser")
            return null;
        }
    }
}
export default new UserService();