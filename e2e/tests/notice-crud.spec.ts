import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { NoticePage } from '../pages/notice.page';

const TEAM_ID = process.env.E2E_TEAM_ID || '';
const TEST_NOTICE_TITLE = `E2E Test Notice ${Date.now()}`;
const EDITED_NOTICE_TITLE = `E2E Edited Notice ${Date.now()}`;

/**
 * Notice CRUD E2E Tests
 *
 * Tests create, edit, and delete operations for notices.
 * Runs in serial mode — each test depends on the previous.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 */
test.describe('Notice CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let noticePage: NoticePage;

  test.beforeAll(async ({ browser }) => {
    // Shared setup could go here if needed
  });

  test('create a new notice', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    noticePage = new NoticePage(page, TEAM_ID);

    // Navigate to notice board
    await page.locator('[data-testid="nav-notice"]').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/notice-board/);

    // Navigate to create notice page
    await noticePage.gotoCreate();
    await noticePage.expectFormVisible();

    // Fill title and submit
    await noticePage.fillAndSubmit(TEST_NOTICE_TITLE, 'This is a test notice body created by E2E tests.');

    // Should redirect back to notice board or show success
    await page.waitForTimeout(3000);

    // Navigate to notice board to verify
    await noticePage.goto();
    await page.waitForTimeout(3000);

    // The created notice should appear in the list
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(TEST_NOTICE_TITLE);
  });

  test('edit an existing notice', async ({ page }) => {
    await login(page);

    const noticePage = new NoticePage(page, TEAM_ID);
    await noticePage.goto();
    await page.waitForTimeout(3000);

    // Find and click on the test notice we created
    const noticeItem = page.locator('[data-testid="notice-item"]', { hasText: TEST_NOTICE_TITLE });
    await expect(noticeItem).toBeVisible({ timeout: 10000 });
    await noticeItem.click();
    await page.waitForTimeout(500);

    // Open the menu and click edit
    await noticePage.openNoticeMenu();
    await noticePage.noticeEdit.click();
    await page.waitForTimeout(2000);

    // Should navigate to edit page
    await expect(page).toHaveURL(/edit-notice/);

    // The form should load with the existing title
    await noticePage.expectFormVisible();
    await page.waitForTimeout(1000);

    // Clear and type new title
    await noticePage.titleInput.clear();
    await noticePage.titleInput.fill(EDITED_NOTICE_TITLE);

    // Submit through all steps
    await noticePage.submitButton.click();
    await page.waitForTimeout(500);
    // Skip through remaining steps if any
    const stillVisible = await noticePage.noticeForm.isVisible().catch(() => false);
    if (stillVisible) {
      await noticePage.submitButton.click();
      await page.waitForTimeout(500);
    }
    const stillVisible2 = await noticePage.noticeForm.isVisible().catch(() => false);
    if (stillVisible2) {
      await noticePage.submitButton.click();
    }
    await page.waitForTimeout(3000);

    // Navigate to notice board and verify the edit
    await noticePage.goto();
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(EDITED_NOTICE_TITLE);
  });

  test('delete a notice', async ({ page }) => {
    await login(page);

    const noticePage = new NoticePage(page, TEAM_ID);
    await noticePage.goto();
    await page.waitForTimeout(3000);

    // Find the edited test notice
    const noticeItem = page.locator('[data-testid="notice-item"]', { hasText: EDITED_NOTICE_TITLE });
    await expect(noticeItem).toBeVisible({ timeout: 10000 });

    // Get count before delete
    const countBefore = await page.locator('[data-testid="notice-item"]').count();

    // Click to expand and delete
    await noticeItem.click();
    await page.waitForTimeout(500);

    await noticePage.deleteNotice();

    // Verify the notice is gone
    await page.waitForTimeout(2000);
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain(EDITED_NOTICE_TITLE);
  });
});
