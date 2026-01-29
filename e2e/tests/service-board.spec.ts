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
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToTeam(page);
  });

  test('loads service board page', async ({ page }) => {
    const board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // Should be on service-board route
    await expect(page).toHaveURL(/service-board/);
  });

  test('displays bottom navigation', async ({ page }) => {
    const board = new ServiceBoardPage(page);
    await board.expectLoaded();

    // Bottom nav should have navigation links
    await expect(board.bottomNav).toBeVisible();
  });

  test('can navigate to create service', async ({ page }) => {
    const board = new ServiceBoardPage(page);
    await board.expectLoaded();

    await board.clickCreateService();

    // Should navigate to create-service route
    await expect(page).toHaveURL(/create-service/, { timeout: 5000 });
  });
});
