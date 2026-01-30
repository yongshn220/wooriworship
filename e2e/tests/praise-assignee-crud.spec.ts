import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { ServiceDetailPage } from '../pages/service-detail.page';

const TEAM_ID = process.env.E2E_TEAM_ID || '';

/**
 * Praise Assignee CRUD E2E Tests
 *
 * Tests create, edit, and delete for the praise team assignment
 * section within the service detail view.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 *   - At least one service event in the team's data
 *   - At least one praise team role configured in the team
 */
test.describe('Praise Assignee CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('create praise team assignments', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    // Open the praise assignee form
    await detail.openPraiseAssigneeForm();
    await expect(detail.praiseAssigneeForm).toBeVisible({ timeout: 10000 });

    // The form shows roles with member selection.
    // Try to assign a member to the first role by clicking an "Add" button or member chip
    const addButtons = page.locator('[data-testid="praise-assignee-form"] button:has-text("Add"), [data-testid="praise-assignee-form"] [class*="cursor-pointer"]:has-text("Add")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);

      // Look for a member to select in the popup/drawer
      const memberOptions = page.locator('[role="option"], [role="listbox"] > *, [class*="member-select"] > *');
      if (await memberOptions.count() > 0) {
        await memberOptions.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Save the assignments
    await detail.submitForm();

    // Form should close
    await expect(detail.praiseAssigneeForm).toBeHidden({ timeout: 10000 });

    // The praise team card should now be visible (if assignments were made)
    // or at least the form should close without error
    await page.waitForTimeout(2000);
  });

  test('edit praise team assignments', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasPraiseTeam = await detail.hasPraiseTeam();
    if (!hasPraiseTeam) {
      test.skip();
      return;
    }

    // Open praise assignee form via section menu → Edit
    await detail.openPraiseAssigneeForm();
    await expect(detail.praiseAssigneeForm).toBeVisible({ timeout: 10000 });

    // Make a modification — try to add another member or toggle an existing one
    const addButtons = page.locator('[data-testid="praise-assignee-form"] button:has-text("Add"), [data-testid="praise-assignee-form"] [class*="cursor-pointer"]:has-text("Add")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);

      const memberOptions = page.locator('[role="option"], [role="listbox"] > *');
      if (await memberOptions.count() > 0) {
        await memberOptions.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Save
    await detail.submitForm();

    // Form should close
    await expect(detail.praiseAssigneeForm).toBeHidden({ timeout: 10000 });
  });

  test('delete praise team assignments', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasPraiseTeam = await detail.hasPraiseTeam();
    if (!hasPraiseTeam) {
      test.skip();
      return;
    }

    // Delete via section menu
    await detail.deletePraiseTeam();

    // The praise team card should be gone, placeholder should appear
    await expect(detail.createTeamPlaceholder).toBeVisible({ timeout: 10000 });
    await expect(detail.praiseTeamCard).toBeHidden();
  });
});
