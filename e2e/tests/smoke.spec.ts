import { test, expect } from '@playwright/test';

/**
 * Smoke tests - verify the app boots and core pages render.
 * These run without authentication to catch deployment issues fast.
 */
test.describe('Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');

    // Wait for Framer Motion animations to settle
    await page.waitForTimeout(1000);

    // Should see login form or be redirected to board (if already authed)
    const emailInput = page.getByLabel('Email');
    const isLanding = await emailInput.isVisible().catch(() => false);
    const isBoard = page.url().includes('/board');

    expect(isLanding || isBoard).toBeTruthy();
  });

  test('login form is interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Skip if already authenticated
    if (page.url().includes('/board')) {
      test.skip();
      return;
    }

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify form accepts input
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // Verify submit button exists
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
