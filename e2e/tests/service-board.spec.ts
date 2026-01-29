import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { ServiceBoardPage } from '../pages/service-board.page';

/**
 * Service Board E2E Tests
 *
 * Prerequisites:
 *   - Set E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID env vars
 *   - Dev server running on localhost:3000
 *
 * Run: npx playwright test e2e/tests/service-board.spec.ts
 */
test.describe('Service Board', () => {
  // Run sequentially - each test shares the same login flow
  test.describe.configure({ mode: 'serial' });

  test('login and navigate to service board', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    // Should be on service-board route
    await expect(page).toHaveURL(/service-board/);

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/service-board-loaded.png' });
  });

  test('service board shows content after login', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // Page should have rendered past the loading state
    // Check for any visible text content on the page
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
