import { Page, Locator, expect } from '@playwright/test';

export class NoticePage {
  readonly page: Page;
  readonly teamId: string;

  // List
  readonly noticeList: Locator;
  readonly noticeItems: Locator;
  readonly createNoticeButton: Locator;

  // Notice Menu (inside expanded notice)
  readonly noticeMenu: Locator;
  readonly noticeEdit: Locator;
  readonly noticeDelete: Locator;

  // Form
  readonly noticeForm: Locator;
  readonly titleInput: Locator;
  readonly bodyInput: Locator;
  readonly submitButton: Locator;
  readonly formClose: Locator;

  // Dialog
  readonly dialogConfirm: Locator;
  readonly dialogCancel: Locator;

  constructor(page: Page, teamId: string) {
    this.page = page;
    this.teamId = teamId;

    // List
    this.noticeList = page.locator('[data-testid="notice-list"]');
    this.noticeItems = page.locator('[data-testid="notice-item"]');
    this.createNoticeButton = page.locator('[data-testid="create-notice-button"]');

    // Notice Menu
    this.noticeMenu = page.locator('[data-testid="notice-menu"]');
    this.noticeEdit = page.locator('[data-testid="notice-edit"]');
    this.noticeDelete = page.locator('[data-testid="notice-delete"]');

    // Form
    this.noticeForm = page.locator('[data-testid="notice-form"]');
    this.titleInput = page.locator('[data-testid="notice-title-input"]');
    this.bodyInput = page.locator('[data-testid="notice-body-input"]');
    this.submitButton = page.locator('[data-testid="form-submit"]');
    this.formClose = page.locator('[data-testid="form-close"]');

    // Dialog
    this.dialogConfirm = page.locator('[data-testid="dialog-confirm"]');
    this.dialogCancel = page.locator('[data-testid="dialog-cancel"]');
  }

  /** Navigate to notice board */
  async goto() {
    await this.page.goto(`/board/${this.teamId}/notice-board`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
  }

  /** Navigate to create notice page */
  async gotoCreate() {
    await this.page.goto(`/board/${this.teamId}/create-notice`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
  }

  /** Wait for notice list to appear */
  async expectListVisible() {
    await expect(this.noticeList).toBeVisible({ timeout: 15000 });
  }

  /** Wait for the form to appear */
  async expectFormVisible() {
    await expect(this.noticeForm).toBeVisible({ timeout: 15000 });
  }

  /** Wait for the form to disappear */
  async expectFormHidden() {
    await expect(this.noticeForm).toBeHidden({ timeout: 15000 });
  }

  /** Get count of notice items */
  async getNoticeCount(): Promise<number> {
    return await this.noticeItems.count();
  }

  /** Click the first notice item to expand it */
  async clickFirstNotice() {
    await this.noticeItems.first().click();
    await this.page.waitForTimeout(500);
  }

  /** Click nth notice item (0-indexed) */
  async clickNotice(index: number) {
    await this.noticeItems.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /** Open the menu on an expanded notice */
  async openNoticeMenu() {
    await this.noticeMenu.click();
    await this.page.waitForTimeout(300);
  }

  /** Fill and submit the notice form */
  async fillAndSubmit(title: string, body?: string) {
    await this.titleInput.fill(title);
    if (body) {
      // Click next to go to body step
      await this.submitButton.click();
      await this.page.waitForTimeout(500);
      await this.bodyInput.fill(body);
    }
    // Click submit (may need to click through remaining steps)
    await this.submitButton.click();
    // If there's a 3rd step (attachments), skip it
    await this.page.waitForTimeout(500);
    // Check if form is still visible (another step)
    const stillVisible = await this.noticeForm.isVisible().catch(() => false);
    if (stillVisible) {
      await this.submitButton.click();
    }
    await this.page.waitForTimeout(2000);
  }

  /** Delete via menu and confirm dialog */
  async deleteNotice() {
    await this.openNoticeMenu();
    await this.noticeDelete.click();
    await this.page.waitForTimeout(500);
    await this.dialogConfirm.click();
    await this.page.waitForTimeout(2000);
  }
}
