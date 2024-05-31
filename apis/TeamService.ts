import { BaseService } from ".";
import { Team } from "@/models/team";
import {arrayUnion} from "@firebase/firestore";

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
        }
        else {
            console.log("there is an error.")
            return null;
        }
    }
}
export default new TeamService();
