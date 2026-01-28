import { renderHook, act } from "@testing-library/react";
import { useInvitationActions } from "./use-invitation-actions";
import { InvitationApi, TeamApi, UserApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { InvitationStatus } from "@/components/constants/enums";
import { RecoilRoot } from "recoil";

// Mocks
jest.mock("@/apis", () => ({
    InvitationService: {
        updateInvitation: jest.fn(),
    },
    TeamService: {
        addNewMember: jest.fn(),
    },
    UserService: {
        addNewTeam: jest.fn(),
    },
}));

jest.mock("@/components/ui/use-toast", () => ({
    toast: jest.fn(),
}));

// Mock Firebase Auth (assumed processed inside hook or component, but for now we mock user inputs)
// However, the hook likely reads current user from Firebase Auth globally or passes it in.
// Let's assume the hook takes args or we mock auth.
jest.mock("@/firebase", () => ({
    auth: {
        currentUser: { uid: "test-user-uid", email: "test@example.com" }
    }
}));

describe("useInvitationActions", () => {
    const mockInvitation = {
        id: "invitation-1",
        sender_id: "sender-1",
        team_id: "team-1",
        invite_date: new Date(),
        invitation_status: InvitationStatus.Pending,
        receiver_email: "test@example.com",
    };

    const mockTeam = {
        id: "team-1",
        name: "Test Team",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("handleAccept should call necessary services and show success toast", async () => {
        (InvitationApi.updateInvitation as jest.Mock).mockResolvedValue(true);
        (UserApi.addNewTeam as jest.Mock).mockResolvedValue(true);
        (TeamApi.addNewMember as jest.Mock).mockResolvedValue(true);

        const { result } = renderHook(() => useInvitationActions(), {
            wrapper: RecoilRoot
        });

        await act(async () => {
            await result.current.handleAccept(mockInvitation, mockTeam as any);
        });

        expect(InvitationApi.updateInvitation).toHaveBeenCalledWith("team-1", "invitation-1", InvitationStatus.Accepted);
        expect(UserApi.addNewTeam).toHaveBeenCalledWith("test-user-uid", "team-1");
        expect(TeamApi.addNewMember).toHaveBeenCalledWith("test-user-uid", "team-1");
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("successfully joined") }));
    });

    it("handleDecline should update status and show decline toast", async () => {
        (InvitationApi.updateInvitation as jest.Mock).mockResolvedValue(true);

        const { result } = renderHook(() => useInvitationActions(), {
            wrapper: RecoilRoot
        });

        await act(async () => {
            await result.current.handleDecline(mockInvitation, mockTeam as any);
        });

        expect(InvitationApi.updateInvitation).toHaveBeenCalledWith("team-1", "invitation-1", InvitationStatus.Rejected);
        expect(UserApi.addNewTeam).not.toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("declined invitation") }));
    });

    it("should handle error during accept", async () => {
        (InvitationApi.updateInvitation as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useInvitationActions(), {
            wrapper: RecoilRoot
        });

        await act(async () => {
            await result.current.handleAccept(mockInvitation, mockTeam as any);
        });

        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Oops, Something went wrong." }));
    });
});
