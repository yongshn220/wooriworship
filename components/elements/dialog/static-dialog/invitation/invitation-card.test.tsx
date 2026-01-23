import { render, screen, fireEvent } from "@testing-library/react";
import { InvitationCard } from "./invitation-card";
import { InvitationStatus } from "@/components/constants/enums";
import { RecoilRoot } from "recoil";

// Mock Hook
jest.mock("./use-invitation-actions", () => ({
    useInvitationActions: () => ({
        handleAccept: jest.fn(),
        handleDecline: jest.fn(),
        isLoading: false
    })
}));

// Mock Recoil atoms needed by component (User/Team)
// Since the component uses Recoil to fetch sender and team details, we need to mock or setup Recoil state.
// However, setting up complex Recoil state in test can be verbose. 
// A simpler approach for this "UI Unit Test" is to mock the Recoil hooks if we want to isolate UI from State,
// or provide a wrapper. The component calls `useRecoilValue(userAtom...)`.
// Let's mock the `invitation-card` rendering logic's dependencies or just mock the hook that provides data if possible?
// The component currently uses `useRecoilValue(userAtom)` directly.
// To make TDD smoother, we assume the component *receives* data or we mock the `useRecoilValue`.
// Let's mock `recoil`.
jest.mock("recoil", () => ({
    ...jest.requireActual("recoil"),
    useRecoilValue: jest.fn((atom) => {
        // Basic mock based on atom key string if possible, or just return dummy data
        // This is brittle. Better refactor component to take props? 
        // BUT the plan said "Refactor InvitationCard". 
        // Ideally, "Smart" containers pass props to "Dumb" UI.
        // However, sticking to current architecture:
        // We will return mock data for any selector.
        return { name: "Mock Team", email: "sender@example.com" };
    }),
    useSetRecoilState: jest.fn(() => jest.fn()),
}));

describe("InvitationCard", () => {
    const mockInvitation = {
        id: "invitation-1",
        sender_id: "sender-1",
        team_id: "team-1",
        invite_date: new Date("2023-01-01"),
        invitation_status: InvitationStatus.Pending,
        receiver_email: "test@example.com",
    };

    it("renders team name and sender info", () => {
        render(<InvitationCard invitation={mockInvitation as any} />);

        expect(screen.getByText("Mock Team")).toBeInTheDocument();
        expect(screen.getByText(/sender@example.com/)).toBeInTheDocument();
    });

    it("renders actions", () => {
        render(<InvitationCard invitation={mockInvitation as any} />);

        expect(screen.getByRole("button", { name: /Join/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Decline/i })).toBeInTheDocument();
    });
});
