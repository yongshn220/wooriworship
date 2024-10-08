
import { auth, firebaseApp } from "@/firebase";
import { BaseService, UserService } from './';
import {User} from "@/models/user";

class AuthService extends BaseService {
    constructor() {
        super("users");
    }

    async login(email: string, password: string) {
        const user = await auth.signInWithEmailAndPassword(email, password);
        if (user.user) {
            const serverUserInfo = await UserService.getById(user.user.uid) as User;
            await UserService.update(user.user.uid, {last_logged_in_time: new Date()});
            return serverUserInfo;
        }
        return null;
    }

    async loginTemp(email: string, password: string) {
        const user = await auth.signInWithEmailAndPassword(email, password);
        if (user.user) {
            await UserService.update(user.user.uid, {last_logged_in_time: new Date()});
            return {uid: user.user.uid}
        }
        return null;
    }

    async loginWithCustomToken(token: string) {
        const user = await auth.signInWithCustomToken(token);
        if (user.user) {
            await UserService.update(user.user.uid, {last_logged_in_time: new Date()});
            console.log("SUC - loginWithCustomToken")
            return true
        }
        return null;
    }

    async logout() {
        await auth.signOut();
    }

    async register(email: string, password: string) {
        if (auth.currentUser) {
            await this.logout();
        }
        return await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
    }

}
export default new AuthService();
