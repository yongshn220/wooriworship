import { BaseService } from ".";
import { Team } from "@/models/team";

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
}
export default new TeamService();