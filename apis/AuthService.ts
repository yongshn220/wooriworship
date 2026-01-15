
import { auth } from "@/firebase";
import BaseService from './BaseService';
import { UserService } from './';
import { User } from "@/models/user";
import {
    signInWithEmailAndPassword,
    signInWithCustomToken,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    User as FirebaseUser
} from "firebase/auth";

class AuthService extends BaseService {
    constructor() {
        super("users");
    }

    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            const serverUserInfo = await UserService.getById(userCredential.user.uid) as User;
            await UserService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return serverUserInfo;
        }
        return null;
    }

    async loginTemp(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await UserService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return { uid: userCredential.user.uid }
        }
        return null;
    }

    async loginWithCustomToken(token: string) {
        const userCredential = await signInWithCustomToken(auth, token);
        if (userCredential.user) {
            await UserService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return true
        }
        return null;
    }

    async logout() {
        await signOut(auth);
    }

    async register(email: string, password: string) {
        if (auth.currentUser) {
            await this.logout();
        }
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    async sendEmailVerification(user: FirebaseUser) {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
        }
    }

    async resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

}
export default new AuthService();
