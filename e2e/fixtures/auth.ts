import { expect, Page } from '@playwright/test';

/**
 * Login via the form and wait for Firebase Auth to settle.
 *
 * After login, RoutePage redirects to a team board. But the auto-selected
 * team might not exist in the current Firestore database. So we only wait
 * for auth to be established, not for a specific URL. Use navigateToTeam()
 * after login() to go to the correct team.
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

  // Wait for auth to take effect: either the URL changes away from /
  // (redirect to board) or the page starts showing a loading spinner.
  // We use a short wait then let navigateToTeam handle the rest.
  await page.waitForURL((url) => url.pathname !== '/' || url.toString().includes('/board'), {
    timeout: 30000,
  }).catch(() => {
    // Even if URL didn't change, auth might be set — navigateToTeam will handle it
  });

  // Brief settle time for Firebase Auth state to propagate
  await page.waitForTimeout(2000);
}

/**
 * Navigate to team's service board and wait for content to render.
 *
 * Team ID priority: explicit param > env var > extracted from current URL.
 */
export async function navigateToTeam(page: Page, teamId?: string) {
  let id = teamId || process.env.E2E_TEAM_ID;

  // Fallback: extract team ID from current URL
  if (!id) {
    const match = page.url().match(/\/board\/([^/]+)/);
    if (match) {
      id = match[1];
    }
  }

  if (!id) {
    throw new Error('Team ID required. Set E2E_TEAM_ID, pass teamId, or login first.');
  }

  const targetPath = `/board/${id}/service-board`;

  // Always navigate directly to the target team's service board.
  // This avoids issues with RoutePage redirecting to a non-existent team.
  await page.goto(targetPath, { waitUntil: 'domcontentloaded' });

  // Wait for the URL to stabilize on this team's board
  await waitForStableUrl(page, `/board/${id}`, 30000);

  // Wait for the service board content to appear
  await page.waitForFunction(
    () => {
      const hasCalendar = document.querySelector('[data-testid="calendar-strip"]');
      const hasEmptyState = document.querySelector('[class*="border-dashed"]');
      const noSpinner = document.querySelectorAll('[class*="animate-spin"]').length === 0;
      return (hasCalendar || hasEmptyState) && noSpinner;
    },
    { timeout: 30000 }
  );
}

/**
 * Wait for the URL to stabilize on a path containing the given substring.
 * Handles the Firebase auth redirect loop where URL bounces between routes.
 */
async function waitForStableUrl(page: Page, urlSubstring: string, timeout: number) {
  const start = Date.now();
  let lastMatchTime = 0;

  while (Date.now() - start < timeout) {
    const url = page.url();
    if (url.includes(urlSubstring)) {
      if (lastMatchTime === 0) lastMatchTime = Date.now();
      // URL has been stable for 3 seconds
      if (Date.now() - lastMatchTime > 3000) return;
    } else {
      lastMatchTime = 0;
    }
    await page.waitForTimeout(500);
  }

  if (!page.url().includes(urlSubstring)) {
    throw new Error(
      `URL never stabilized on "${urlSubstring}". Last URL: ${page.url()}`
    );
  }
}

export { expect };
