import { BaseService, UserService } from ".";
import { Team } from "@/models/team";
import {arrayUnion, arrayRemove} from "@firebase/firestore";

class TeamService extends BaseService {
    constructor() {
        super("teams");
    }

    async addNewTeam(userId: string, name: string) {
        const team = {
            name: name,
            create_time: new Date(),
            last_worship_time: new Date(),
            leaders: [userId],
            users: [userId]
        }
        return await this.create(team);
    }

    async addNewMember(userId: string, teamId: string) {
        if (userId && teamId) {
            await this.update(teamId, {users: arrayUnion(userId)});
            return teamId;
        } else {
            console.log("there is an error.")
            return null;
        }
    }

    async removeMember(userId: string, teamId: string) {
        if(userId && teamId) {
            const promises = [];
            promises.push(UserService.leaveTeam(userId, teamId));
            promises.push(this.update(teamId, {users: arrayRemove(userId)}));
            await Promise.all(promises);
            return userId;
        } else {
            console.log("user id or team id is missing");
            return false;
        }
    }

    async deleteTeam(team:Team) {
        const promises:any = [];
        for(const user of team.users) {
            promises.push(UserService.leaveTeam(user, team.id));
        }
        promises.push(this.delete(team.id));
        await Promise.all(promises);
        return true;
    }
}
export default new TeamService();