import { AuthApi } from "./AuthApi";
import { UserApi } from "./";
import {
    signInWithEmailAndPassword,
    signInWithCustomToken,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification
} from "firebase/auth";

// Mock dependencies
jest.mock("@/firebase", () => ({
    auth: {
        currentUser: null,
    },
}));

jest.mock("./UserApi", () => ({
    getById: jest.fn(),
    update: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: jest.fn(),
    signInWithCustomToken: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

describe("AuthService", () => {
    let serviceInstance: any;
    const mockAuth: any = { currentUser: null };
    const mockUserService: any = {
        getById: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        const AuthServiceClass = require("./AuthApi").AuthService;
        AuthServiceClass["instance"] = null; // Reset singleton

        serviceInstance = AuthServiceClass.getInstance(mockAuth, mockUserService);
    });

    describe("login", () => {
        it("should login user and update last logged in time", async () => {
            const mockUser = { uid: "user-1", email: "test@test.com" };
            const mockServerUser = { id: "user-1", name: "Test User" };

            (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
            mockUserApi.getById.mockResolvedValue(mockServerUser);

            const result = await serviceInstance.login("test@test.com", "password");

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, "test@test.com", "password");
            expect(mockUserApi.getById).toHaveBeenCalledWith("user-1");
            expect(mockUserApi.update).toHaveBeenCalledWith("user-1", expect.objectContaining({ last_logged_in_time: expect.any(Date) }));
            expect(result).toEqual(mockServerUser);
        });

        it("should return null if login fails or no user", async () => {
            (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: null });

            const result = await serviceInstance.login("test@test.com", "password");

            expect(result).toBeNull();
            expect(mockUserApi.update).not.toHaveBeenCalled();
        });
    });

    describe("register", () => {
        it("should register new user", async () => {
            const mockUser = { uid: "new-user", email: "new@test.com" };
            (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

            await serviceInstance.register("new@test.com", "password");

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, "new@test.com", "password");
        });

        it("should logout current user before registering if one exists", async () => {
            // Mock currentUser existing on the injected auth
            serviceInstance.auth.currentUser = { uid: "old-user" };
            (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: {} });

            await serviceInstance.register("new@test.com", "password");

            expect(signOut).toHaveBeenCalledWith(mockAuth);
            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        it("should sign out", async () => {
            await serviceInstance.logout();
            expect(signOut).toHaveBeenCalledWith(mockAuth);
        });
    });

    describe("sendEmailVerification", () => {
        it("should send verification email if user exists and not verified", async () => {
            const mockUser = { emailVerified: false };
            await serviceInstance.sendEmailVerification(mockUser);
            expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
        });

        it("should not send if user verified", async () => {
            const mockUser = { emailVerified: true };
            await serviceInstance.sendEmailVerification(mockUser);
            expect(sendEmailVerification).not.toHaveBeenCalled();
        });
    });

    describe("resetPassword", () => {
        it("should send password reset email", async () => {
            await serviceInstance.resetPassword("reset@test.com");
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, "reset@test.com");
        });
    });
});
