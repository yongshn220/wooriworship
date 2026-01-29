import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { ServiceBoardPage } from '../pages/service-board.page';

/**
 * Service Detail E2E Tests
 *
 * Verifies the core service board experience:
 * - Calendar strip renders with date cards
 * - Service detail view loads with sections
 * - Navigation between tabs works
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 *   - At least one service event in the team's data
 */
test.describe('Service Detail View', () => {
  test.describe.configure({ mode: 'serial' });

  let board: ServiceBoardPage;

  test('loads service board with calendar and detail', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // Calendar strip should be visible
    await expect(board.calendarStrip).toBeVisible();

    // CALENDAR button should be visible
    await expect(board.calendarButton).toBeVisible();

    // Service detail section should load (auto-selects nearest upcoming event)
    await board.expectDetailVisible();

    // Info card should show a title and date
    const title = await board.getServiceTitle();
    expect(title.length).toBeGreaterThan(0);

    const date = await board.getServiceDate();
    expect(date).toMatch(/\d{4}\./); // Format: "2025. 1. 26 (Sun)"
  });

  test('service detail shows three sections', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    board = new ServiceBoardPage(page);
    await board.expectLoaded();
    await board.expectDetailVisible();

    // Each section should be either content or empty placeholder
    // At minimum, the detail view should render all three section areas
    const detail = board.serviceDetail;

    // Check for setlist section: either has songs or shows "Create Setlist"
    const hasSetlistContent = await detail.getByText('Create Setlist').isVisible().catch(() => false);
    const hasSongCards = await detail.locator('[class*="song"], [class*="setlist"]').first().isVisible().catch(() => false);
    expect(hasSetlistContent || hasSongCards).toBeTruthy();

    // Check for team section: either has assignments or shows "Assign Team"
    const hasTeamPlaceholder = await detail.getByText('Assign Team').isVisible().catch(() => false);
    const hasTeamContent = await detail.getByText('Praise Team').isVisible().catch(() => false);
    expect(hasTeamPlaceholder || hasTeamContent).toBeTruthy();

    // Check for flow section: either has flow items or shows "Create Flow"
    const hasFlowPlaceholder = await detail.getByText('Create Flow').isVisible().catch(() => false);
    const hasFlowContent = await detail.getByText('Service Order').isVisible().catch(() => false);
    expect(hasFlowPlaceholder || hasFlowContent).toBeTruthy();
  });

  test('bottom navigation tabs are visible', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // All four nav tabs should be visible
    await expect(board.navNotice).toBeVisible();
    await expect(board.navService).toBeVisible();
    await expect(board.navSong).toBeVisible();
    await expect(board.navManage).toBeVisible();
  });

  test('navigate to Song tab and back', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // Click Song tab
    await board.navSong.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should navigate to song page
    await expect(page).toHaveURL(/song/);

    // Navigate back to Service
    await board.navService.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should be back on service board
    await expect(page).toHaveURL(/service-board/);
  });
});
