import { test as base, expect, Page } from '@playwright/test';

/**
 * Auth fixture that handles Firebase login.
 *
 * Usage:
 *   Set E2E_USER_EMAIL and E2E_USER_PASSWORD environment variables,
 *   or create a .env.test file in the project root.
 *
 *   E2E_USER_EMAIL=test@example.com
 *   E2E_USER_PASSWORD=testpassword123
 *   E2E_TEAM_ID=your-team-id
 */
export const test = base.extend<{ authenticatedPage: typeof base }>({});

/**
 * Login helper - call in beforeEach or use stored auth state.
 */
export async function login(page: Page) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL and E2E_USER_PASSWORD must be set.\n' +
      'Create a .env.test file or export them before running tests.'
    );
  }

  await page.goto('/');

  // Wait for animations and auth state check
  await page.waitForTimeout(2000);

  // Check if already logged in (redirected to /board)
  if (page.url().includes('/board')) return;

  // Fill login form using label selectors (Playwright best practice)
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for navigation to board (team selector)
  await expect(page).toHaveURL(/\/board/, { timeout: 15000 });
}

/**
 * Navigate to a specific team's board after login.
 */
export async function navigateToTeam(page: Page, teamId?: string) {
  const id = teamId || process.env.E2E_TEAM_ID;
  if (!id) {
    throw new Error('Team ID required. Set E2E_TEAM_ID or pass teamId parameter.');
  }
  await page.goto(`/board/${id}/service-board`);
  await page.waitForLoadState('networkidle');
}

export { expect };
