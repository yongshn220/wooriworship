import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { ServiceDetailPage } from '../pages/service-detail.page';

const TEAM_ID = process.env.E2E_TEAM_ID || '';

/**
 * Service Flow CRUD E2E Tests
 *
 * Tests create, edit, and delete for the service flow (cuesheet)
 * section within the service detail view.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 *   - At least one service event in the team's data
 */
test.describe('Service Flow CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('create a service flow from template', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    // Open the flow form
    await detail.openFlowForm();
    await expect(detail.serviceFlowForm).toBeVisible({ timeout: 10000 });

    // The form shows the cuesheet editor.
    // Look for a "Load Template" or template selection button
    const templateButton = page.locator('[data-testid="service-flow-form"] button:has-text("Template"), [data-testid="service-flow-form"] button:has-text("Load"), [data-testid="service-flow-form"] button:has-text("template")');
    if (await templateButton.count() > 0) {
      await templateButton.first().click();
      await page.waitForTimeout(1000);

      // Select the first template if a list appears
      const templateOptions = page.locator('[role="option"], [role="listbox"] > *, [class*="template"] [class*="cursor-pointer"]');
      if (await templateOptions.count() > 0) {
        await templateOptions.first().click();
        await page.waitForTimeout(500);
      }
    } else {
      // No template button — try adding an item manually via "Add" button
      const addButton = page.locator('[data-testid="service-flow-form"] button:has-text("Add"), [data-testid="service-flow-form"] [class*="add"]');
      if (await addButton.count() > 0) {
        await addButton.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Save the flow
    await detail.submitForm();

    // Form should close
    await expect(detail.serviceFlowForm).toBeHidden({ timeout: 10000 });

    // Wait for data to refresh
    await page.waitForTimeout(2000);
  });

  test('edit a service flow', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasFlow = await detail.hasFlow();
    if (!hasFlow) {
      test.skip();
      return;
    }

    // Open flow form via section menu → Edit
    await detail.openFlowForm();
    await expect(detail.serviceFlowForm).toBeVisible({ timeout: 10000 });

    // Make a modification — look for flow items that can be toggled or reordered
    // Try to add another item via an "Add" button
    const addButton = page.locator('[data-testid="service-flow-form"] button:has-text("Add"), [data-testid="service-flow-form"] [class*="add"]');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForTimeout(500);
    }

    // Save
    await detail.submitForm();

    // Form should close
    await expect(detail.serviceFlowForm).toBeHidden({ timeout: 10000 });
  });

  test('delete a service flow', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const detail = new ServiceDetailPage(page, TEAM_ID);
    await detail.expectDetailVisible();

    const hasFlow = await detail.hasFlow();
    if (!hasFlow) {
      test.skip();
      return;
    }

    // Delete via section menu
    await detail.deleteFlow();

    // The flow card should be gone, placeholder should appear
    await expect(detail.createFlowPlaceholder).toBeVisible({ timeout: 10000 });
    await expect(detail.serviceOrderCard).toBeHidden();
  });
});
