import React from "react";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import { TagSelector } from "./tag-selector";
import TagService from "@/apis/TagService";
import TeamService from "@/apis/TeamService";
import { act } from "react-dom/test-utils";

// Mock dependencies
jest.mock("@/apis/TagService");
jest.mock("@/apis/TeamService");

describe("TagSelector", () => {
    const mockTeamId = "team-123";
    const mockTags = [
        { id: "tag-1", name: "Worship" },
        { id: "tag-2", name: "Prayer" },
    ];
    const mockServiceTags = [
        { id: "svc-1", name: "Sunday Service" },
        { id: "svc-2", name: "Friday Prayer" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (TagService.getTeamTags as jest.Mock).mockResolvedValue(mockTags);
        (TeamService.getById as jest.Mock).mockResolvedValue({ service_tags: mockServiceTags });
    });

    it("renders with placeholder", async () => {
        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={jest.fn()}
                placeholder="Select tags..."
            />
        );

        expect(screen.getByText("Select tags...")).toBeInTheDocument();
    });

    it("fetches and displays available tags in 'song' mode", async () => {
        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={jest.fn()}
                mode="song"
            />
        );

        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(TagService.getTeamTags).toHaveBeenCalledWith(mockTeamId);
        });

        expect(screen.getByText("Worship")).toBeInTheDocument();
        expect(screen.getByText("Prayer")).toBeInTheDocument();
    });

    it("fetches and displays available tags in 'service' mode", async () => {
        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={jest.fn()}
                mode="service"
            />
        );

        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(TeamService.getById).toHaveBeenCalledWith(mockTeamId);
        });

        expect(screen.getByText("Sunday Service")).toBeInTheDocument();
        expect(screen.getByText("Friday Prayer")).toBeInTheDocument();
    });

    it("selects a tag and calls onTagsChange", async () => {
        const onTagsChange = jest.fn();
        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={onTagsChange}
                mode="song"
            />
        );

        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        await waitFor(() => screen.getByText("Worship"));

        fireEvent.click(screen.getByText("Worship"));

        expect(onTagsChange).toHaveBeenCalledWith(["Worship"]);
    });

    it("creates a new tag calling appropriate service", async () => {
        const onTagsChange = jest.fn();
        (TagService.addNewTag as jest.Mock).mockResolvedValue(true);
        // Mock getTeamTags to return the new tag after addition
        (TagService.getTeamTags as jest.Mock)
            .mockResolvedValueOnce(mockTags)
            .mockResolvedValueOnce([...mockTags, { id: "tag-3", name: "New Tag" }]);

        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={onTagsChange}
                mode="song"
            />
        );

        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        const input = screen.getByPlaceholderText("Search or create tag...");
        fireEvent.change(input, { target: { value: "New Tag" } });

        const createButton = await screen.findByText('Create "New Tag"');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(TagService.addNewTag).toHaveBeenCalledWith(mockTeamId, "New Tag");
        });

        // Optimistic update check or after refresh
        expect(onTagsChange).toHaveBeenCalledWith(["New Tag"]);
    });

    it("deletes a tag with confirmation", async () => {
        (TagService.deleteTag as jest.Mock).mockResolvedValue(true);
        (TagService.getTeamTags as jest.Mock)
            .mockResolvedValueOnce(mockTags)
            .mockResolvedValueOnce([mockTags[1]]); // Return only remaining tags

        render(
            <TagSelector
                teamId={mockTeamId}
                selectedTags={[]}
                onTagsChange={jest.fn()}
                mode="song"
            />
        );

        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);

        await waitFor(() => screen.getByText("Worship"));

        // Find delete button for "Worship" - complicated structure, might need testId or closer look at DOM
        // The TagSelector renders trash icon button.
        const items = screen.getAllByRole("option"); // CommandItem renders as option usually? No, it's div with role="option" if using regular Command
        // shadcn CommandItem might not have role="option" by default depending on version, let's find by text and traverse
        const worshipItem = screen.getByText("Worship").closest("div[data-value='Worship']");
        // Since direct DOM traversal in test is brittle, let's assume buttons are accessible.
        // Let's find the trash icon.
        // We can use getAllByRole('button') but needed specific one.

        // Let's rely on the fact that "Worship" text is adjacent to buttons in the item
        // Actually, checking the code:
        // Wait for the delete buttons to be available
        const deleteButtons = await screen.findAllByRole("button", { name: /Delete tag/i });

        // Click the first one (corresponding to Worship)
        fireEvent.click(deleteButtons[0]);

        // Expect confirmation dialog
        expect(screen.getByText("Delete 'Worship'?")).toBeInTheDocument();

        const confirmButton = screen.getByText("Delete"); // DeleteConfirmationDialog usually has "Delete" button
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(TagService.deleteTag).toHaveBeenCalledWith(mockTeamId, "Worship");
        });
    });
});
