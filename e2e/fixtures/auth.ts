import { expect, Page } from '@playwright/test';

/**
 * Login and wait for auth to settle.
 * Firebase Auth + Next.js client-side routing can be slow.
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
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Already logged in?
  if (page.url().includes('/board')) return;

  // Fill and submit login form
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect: Firebase auth + Next.js router.replace can take time
  await page.waitForURL('**/board**', { timeout: 30000 });
}

/**
 * Navigate to team's service board.
 * Uses domcontentloaded instead of networkidle (Firebase keeps sockets open).
 */
export async function navigateToTeam(page: Page, teamId?: string) {
  const id = teamId || process.env.E2E_TEAM_ID;
  if (!id) {
    throw new Error('Team ID required. Set E2E_TEAM_ID or pass teamId parameter.');
  }

  await page.goto(`/board/${id}/service-board`);
  await page.waitForLoadState('domcontentloaded');

  // Wait until either content appears or loading spinner clears
  // (timeout is OK - page may still be loading data)
  await page.waitForFunction(
    () => document.querySelectorAll('[class*="animate-spin"]').length === 0,
    { timeout: 20000 }
  ).catch(() => {});
}

export { expect };
