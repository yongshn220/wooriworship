import { auth, firebaseApp } from "@/firebase";
import { BaseService, UserService } from './';

class AuthService extends BaseService {
    constructor() {
        super("users");
    }

    async login(email: string, password: string) {
        const user = await auth.signInWithEmailAndPassword(email, password);
        
        if(user.user) {
            const serverUserInfo = await UserService.getById(user.user.uid);
            await UserService.update(user.user.uid, {last_logged_in_time: new Date()});
            return serverUserInfo;
        }
        return null;
    }

    async logout() {
        await auth.signOut();
    }

    async register(email: string, password: string) {
        if(auth.currentUser) {
            this.logout();
        }
        return await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
    }

}
export default new AuthService();