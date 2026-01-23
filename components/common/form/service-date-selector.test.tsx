import React from "react";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import { ServiceDateSelector } from "./service-date-selector";
import TeamService from "@/apis/TeamService";
import ServingService from "@/apis/ServingService";
import { format, addDays } from "date-fns";

// Mock dependencies
jest.mock("@/apis/TeamService");
jest.mock("@/apis/ServingService");

describe("ServiceDateSelector", () => {
    const mockTeamId = "team-123";
    const mockDate = new Date();
    const mockOnServiceTagIdsChange = jest.fn();
    const mockOnDateChange = jest.fn();
    const mockServiceTags = [
        { id: "svc-1", name: "Sunday Service" },
        { id: "svc-2", name: "Friday Prayer" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (TeamService.getById as jest.Mock).mockResolvedValue({ service_tags: mockServiceTags });
        (ServingService.getTagStats as jest.Mock).mockResolvedValue({});
        (ServingService.getRecentSchedulesByTag as jest.Mock).mockResolvedValue([]);
    });

    it("renders with initial date and tag selector", async () => {
        render(
            <ServiceDateSelector
                teamId={mockTeamId}
                serviceTagIds={[]}
                onServiceTagIdsChange={mockOnServiceTagIdsChange}
                date={mockDate}
                onDateChange={mockOnDateChange}
            />
        );

        expect(await screen.findByText("Service")).toBeInTheDocument();
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText(format(mockDate, "yyyy-MM-dd (eee)"))).toBeInTheDocument();
    });

    it("generates fallback shortcuts when no stats available", async () => {
        render(
            <ServiceDateSelector
                teamId={mockTeamId}
                serviceTagIds={[]}
                onServiceTagIdsChange={mockOnServiceTagIdsChange}
                date={mockDate}
                onDateChange={mockOnDateChange}
            />
        );

        // Should generate heuristics: Sunday, Friday, Dawn
        await waitFor(() => {
            // Fallback shortcuts logic uses "주일예배" (Sunday), "금요예배" (Friday), "새벽예배" (Dawn)
            // These are hardcoded fallbacks if tags are not found by keyword match
            // Or if tags ARE found (we mocked service tags with English names).
            // Let's check if it tries to find tags matching keywords.
            // "Sunday Service" matches "Sunday".
            // "Friday Prayer" matches "Friday".

            // So we expect buttons with "Sunday Service" and "Friday Prayer"
            expect(screen.getByText("Sunday Service")).toBeInTheDocument();
            expect(screen.getByText("Friday Prayer")).toBeInTheDocument();
        });
    });

    it("generates data-driven shortcuts based on stats", async () => {
        // Mock high usage for Friday Prayer
        (ServingService.getTagStats as jest.Mock).mockResolvedValue({
            "svc-2": { count: 100, last_used_at: new Date().toISOString() } // High score
        });

        render(
            <ServiceDateSelector
                teamId={mockTeamId}
                serviceTagIds={[]}
                onServiceTagIdsChange={mockOnServiceTagIdsChange}
                date={mockDate}
                onDateChange={mockOnDateChange}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Friday Prayer")).toBeInTheDocument();
        });
    });

    it("selects a shortcut date and tag", async () => {
        render(
            <ServiceDateSelector
                teamId={mockTeamId}
                serviceTagIds={[]}
                onServiceTagIdsChange={mockOnServiceTagIdsChange}
                date={mockDate}
                onDateChange={mockOnDateChange}
            />
        );

        await waitFor(() => screen.getByText("Sunday Service"));

        const shortcutBtn = screen.getByText("Sunday Service").closest("button");
        fireEvent.click(shortcutBtn!);

        // Should call both handlers
        expect(mockOnDateChange).toHaveBeenCalled();
        expect(mockOnServiceTagIdsChange).toHaveBeenCalledWith(["svc-1"]); // Sunday Service ID
    });

    it("updates date when calendar day is selected", async () => {
        // The calendar component is rendered within ServiceDateSelector
        render(
            <ServiceDateSelector
                teamId={mockTeamId}
                serviceTagIds={[]}
                onServiceTagIdsChange={mockOnServiceTagIdsChange}
                date={mockDate}
                onDateChange={mockOnDateChange}
            />
        );

        // Find and click a specific date in the calendar
        // React Day Picker usually renders buttons for days.
        // Let's click the 15th of the current month (assuming it exists in view)
        // Or just any day not today.
        const dayButton = screen.getByText("15", { selector: "button" });
        fireEvent.click(dayButton);

        expect(mockOnDateChange).toHaveBeenCalled();
    });
});
