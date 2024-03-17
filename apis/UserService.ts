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
        const outUser: User = {...user, id: userId}
        return outUser
    }
}
export default new UserService();