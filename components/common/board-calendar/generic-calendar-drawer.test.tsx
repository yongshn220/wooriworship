import React from "react";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import { GenericCalendarDrawer } from "./generic-calendar-drawer";
import { setMonth, setYear, format } from "date-fns";

// Mock ResponsiveDrawer to just render children (as it might use portals/complex logic)
jest.mock("@/components/ui/responsive-drawer", () => ({
    ResponsiveDrawer: ({ children, open }: { children: React.ReactNode, open: boolean }) => open ? <div>{children}</div> : null,
}));

// Mock lucide icons specifically if needed, but usually they just render
// If we had issues with "closest" before, we might just use text or role.

describe("GenericCalendarDrawer", () => {
    const mockOnOpenChange = jest.fn();
    const mockOnSelect = jest.fn();
    const today = new Date();

    const mockItems = [
        { id: "1", date: today, title: "Worship Service", description: "Main Hall" },
        { id: "2", date: setMonth(today, today.getMonth() + 1), title: "Next Month Service", description: "Main Hall" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders calendar in 'days' mode by default", () => {
        render(
            <GenericCalendarDrawer
                open={true}
                onOpenChange={mockOnOpenChange}
                items={mockItems}
                selectedId={null}
                onSelect={mockOnSelect}
            />
        );

        // Header checks
        expect(screen.getByText(format(today, "MMMM"))).toBeInTheDocument();
        expect(screen.getByText(format(today, "yyyy"))).toBeInTheDocument();

        // Calendar grid check (e.g. searching for a day number)
        expect(screen.getByText(today.getDate().toString())).toBeInTheDocument();
    });

    it("switches to 'months' view when header is clicked", () => {
        render(
            <GenericCalendarDrawer
                open={true}
                onOpenChange={mockOnOpenChange}
                items={mockItems}
                selectedId={null}
                onSelect={mockOnSelect}
            />
        );

        // Click header to toggle view
        const header = screen.getByText(format(today, "MMMM")).closest("div");
        fireEvent.click(header!);

        // Should see month names
        expect(screen.getByText("Jan")).toBeInTheDocument();
        expect(screen.getByText("Dec")).toBeInTheDocument();
    });

    it("navigates months using chevron buttons", () => {
        render(
            <GenericCalendarDrawer
                open={true}
                onOpenChange={mockOnOpenChange}
                items={mockItems}
                selectedId={null}
                onSelect={mockOnSelect}
            />
        );

        const prevMonth = setMonth(today, today.getMonth() - 1);
        const prevButton = screen.getAllByRole("button")[0]; // Left chevron is usually first locally
        // A better way is to find by icon usage or position, but buttons in header: [Left, Right]
        // The header has [HeaderTitle, ChevronLeft, ChevronRight]

        // Let's use logic:
        // We expect the current month to change.

        // Find buttons. There are buttons in the calendar grid (Days).
        // The navigation buttons are in the header.
        // The header buttons are siblings to the title.

        // Let's rely on implementation details slightly or use container
        // We can use console.log(screen.debug()) if stuck, but let's try assuming standard order in header
        // The header is above the calendar.

        // Actually, generic-calendar-drawer.tsx:
        // <Button onClick={prev}> <ChevronLeft/> </Button>
        // <Button onClick={next}> <ChevronRight/> </Button>

        // We can find by their lucide icon presence, or just by order.
        // Let's try locating the chevrons.
        const buttons = document.querySelectorAll(".lucide-chevron-left");
        fireEvent.click(buttons[0].closest("button")!);

        expect(screen.getByText(format(prevMonth, "MMMM"))).toBeInTheDocument();
    });

    it("displays preview items when a date with schedule is selected", async () => {
        render(
            <GenericCalendarDrawer
                open={true}
                onOpenChange={mockOnOpenChange}
                items={mockItems}
                selectedId={null}
                onSelect={mockOnSelect}
            />
        );

        // Select today (which has an item)
        // The calendar component from shadcn/ui (react-day-picker) uses role="gridcell" for days usually, or interactions
        // Let's find the day button.
        const todayButton = screen.getByText(today.getDate().toString(), { selector: 'button' });
        // Note: React Day Picker uses buttons for days.

        fireEvent.click(todayButton);

        // Preview area should show item
        await waitFor(() => {
            expect(screen.getByText("Worship Service")).toBeInTheDocument();
        });

        // Click on the item to select
        fireEvent.click(screen.getByText("Worship Service"));
        expect(mockOnSelect).toHaveBeenCalledWith("1");
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
});
