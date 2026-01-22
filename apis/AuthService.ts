
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
    User as FirebaseUser,
    Auth
} from "firebase/auth";

export class AuthService extends BaseService {
    private static instance: AuthService;
    private auth: Auth;
    private userService: typeof UserService;

    private constructor(authInstance?: Auth, userService?: typeof UserService) {
        super("users");
        this.auth = authInstance || auth;
        this.userService = userService || UserService;
    }

    public static getInstance(authInstance?: Auth, userService?: typeof UserService): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService(authInstance, userService);
        }
        return AuthService.instance;
    }

    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        if (userCredential.user) {
            const serverUserInfo = await this.userService.getById(userCredential.user.uid) as User;
            await this.userService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return serverUserInfo;
        }
        return null;
    }

    async loginTemp(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        if (userCredential.user) {
            await this.userService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return { uid: userCredential.user.uid }
        }
        return null;
    }

    async loginWithCustomToken(token: string) {
        const userCredential = await signInWithCustomToken(this.auth, token);
        if (userCredential.user) {
            await this.userService.update(userCredential.user.uid, { last_logged_in_time: new Date() });
            return true
        }
        return null;
    }

    async logout() {
        await signOut(this.auth);
    }

    async register(email: string, password: string) {
        if (this.auth.currentUser) {
            await this.logout();
        }
        return await createUserWithEmailAndPassword(this.auth, email, password);
    }

    async sendEmailVerification(user: FirebaseUser) {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
        }
    }

    async resetPassword(email: string) {
        await sendPasswordResetEmail(this.auth, email);
    }
}
export default AuthService.getInstance();
