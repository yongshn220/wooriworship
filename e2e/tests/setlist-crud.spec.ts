import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { ServiceDetailPage } from '../pages/service-detail.page';

const TEAM_ID = process.env.E2E_TEAM_ID || '';

/**
 * Setlist CRUD E2E Tests
 *
 * Tests create, edit, and delete for the setlist section
 * within the service detail view.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 *   - At least one service event in the team's data
 *   - At least one song in the team's song library (for adding to setlist)
 */
test.describe('Setlist CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('create a setlist by adding songs', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    // Check initial state — may already have a setlist or be empty
    const hadSetlistBefore = await detail.hasSetlist();

    // Open the setlist form
    await detail.openSetlistForm();

    // The setlist form should be visible
    await expect(detail.setlistForm).toBeVisible({ timeout: 10000 });

    // The form has 2 steps. First step is "Context" (beginning/ending song).
    // Click next/submit to go to step 2 ("Setlist" - add songs)
    await detail.formSubmit.click();
    await page.waitForTimeout(1000);

    // Step 2: Add songs - look for song items to toggle
    // Try to click the first available song to add it
    const songCheckboxes = page.locator('[data-testid="setlist-form"] input[type="checkbox"], [data-testid="setlist-form"] [role="checkbox"]');
    const songCount = await songCheckboxes.count();

    if (songCount > 0) {
      // Toggle the first song
      await songCheckboxes.first().click();
      await page.waitForTimeout(500);
    } else {
      // If no checkboxes, look for clickable song items
      const songItems = page.locator('[data-testid="setlist-form"] [class*="cursor-pointer"]');
      if (await songItems.count() > 0) {
        await songItems.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Submit the form
    await detail.formSubmit.click();
    await page.waitForTimeout(3000);

    // Verify: setlist card should now be visible (or form closed successfully)
    const formStillVisible = await detail.setlistForm.isVisible().catch(() => false);
    if (formStillVisible) {
      // May need one more click to submit
      await detail.formSubmit.click();
      await page.waitForTimeout(3000);
    }

    // The setlist card should be visible if songs were added
    // If no songs were available, the form should at least close without error
    await expect(detail.setlistForm).toBeHidden({ timeout: 10000 });
  });

  test('edit an existing setlist', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasSetlist = await detail.hasSetlist();
    if (!hasSetlist) {
      test.skip();
      return;
    }

    // Open setlist form via section menu → Edit
    await detail.openSetlistForm();
    await expect(detail.setlistForm).toBeVisible({ timeout: 10000 });

    // Navigate to step 2 (the actual setlist)
    await detail.formSubmit.click();
    await page.waitForTimeout(1000);

    // Toggle a song (add or remove)
    const songCheckboxes = page.locator('[data-testid="setlist-form"] input[type="checkbox"], [data-testid="setlist-form"] [role="checkbox"]');
    if (await songCheckboxes.count() > 0) {
      // Toggle second song if available, otherwise first
      const targetIndex = (await songCheckboxes.count()) > 1 ? 1 : 0;
      await songCheckboxes.nth(targetIndex).click();
      await page.waitForTimeout(500);
    }

    // Save
    await detail.formSubmit.click();
    await page.waitForTimeout(3000);

    // Form should close
    await expect(detail.setlistForm).toBeHidden({ timeout: 10000 });
  });

  test('delete a setlist', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasSetlist = await detail.hasSetlist();
    if (!hasSetlist) {
      test.skip();
      return;
    }

    // Delete via section menu
    await detail.deleteSetlist();

    // The setlist card should be gone, placeholder should appear
    await expect(detail.createSetlistPlaceholder).toBeVisible({ timeout: 10000 });
    await expect(detail.setlistCard).toBeHidden();
  });
});
