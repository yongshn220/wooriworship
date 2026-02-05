import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
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
  if (!page.url().includes('/board')) {
    // Fill and submit login form
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect to board
    await page.waitForURL((url) => url.pathname.includes('/board'), {
      timeout: 30000,
    });
  }

  // Wait for auth to settle
  await page.waitForTimeout(3000);

  // Save storage state
  await page.context().storageState({ path: authFile });
});
