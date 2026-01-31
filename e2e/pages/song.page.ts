import { Page, Locator, expect } from '@playwright/test';

export class SongPage {
  readonly page: Page;
  readonly teamId: string;

  // List
  readonly songList: Locator;
  readonly songItems: Locator;
  readonly createSongButton: Locator;

  // Song Detail Menu
  readonly songMenu: Locator;
  readonly songEdit: Locator;
  readonly songDelete: Locator;

  // Form
  readonly songForm: Locator;
  readonly titleInput: Locator;
  readonly submitButton: Locator;
  readonly formClose: Locator;

  // Dialog
  readonly dialogConfirm: Locator;
  readonly dialogCancel: Locator;

  constructor(page: Page, teamId: string) {
    this.page = page;
    this.teamId = teamId;

    // List
    this.songList = page.locator('[data-testid="song-list"]');
    this.songItems = page.locator('[data-testid="song-item"]');
    this.createSongButton = page.locator('[data-testid="create-song-button"]');

    // Song Detail Menu
    this.songMenu = page.locator('[data-testid="song-menu"]');
    this.songEdit = page.locator('[data-testid="song-edit"]');
    this.songDelete = page.locator('[data-testid="song-delete"]');

    // Form
    this.songForm = page.locator('[data-testid="song-form"]');
    this.titleInput = page.locator('[data-testid="song-title-input"]');
    this.submitButton = page.locator('[data-testid="form-submit"]');
    this.formClose = page.locator('[data-testid="form-close"]');

    // Dialog
    this.dialogConfirm = page.locator('[data-testid="dialog-confirm"]');
    this.dialogCancel = page.locator('[data-testid="dialog-cancel"]');
  }

  /** Navigate to song board */
  async goto() {
    await this.page.goto(`/board/${this.teamId}/song-board`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
  }

  /** Navigate to create song page */
  async gotoCreate() {
    await this.page.goto(`/board/${this.teamId}/create-song`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
  }

  /** Wait for song list to appear */
  async expectListVisible() {
    await expect(this.songList).toBeVisible({ timeout: 15000 });
  }

  /** Wait for form to appear */
  async expectFormVisible() {
    await expect(this.songForm).toBeVisible({ timeout: 15000 });
  }

  /** Wait for form to disappear */
  async expectFormHidden() {
    await expect(this.songForm).toBeHidden({ timeout: 15000 });
  }

  /** Get count of song items */
  async getSongCount(): Promise<number> {
    return await this.songItems.count();
  }

  /** Click first song item */
  async clickFirstSong() {
    await this.songItems.first().click();
    await this.page.waitForTimeout(1000);
  }

  /** Click nth song item (0-indexed) */
  async clickSong(index: number) {
    await this.songItems.nth(index).click();
    await this.page.waitForTimeout(1000);
  }

  /** Open the song detail menu */
  async openSongMenu() {
    await this.songMenu.click();
    await this.page.waitForTimeout(300);
  }

  /** Fill title and submit the song form (clicks through all steps) */
  async fillAndSubmit(title: string) {
    await this.titleInput.fill(title);
    // Click through all steps until form closes
    for (let i = 0; i < 2; i++) {
      await this.submitButton.click();
      await this.page.waitForTimeout(500);
      const stillVisible = await this.songForm.isVisible().catch(() => false);
      if (!stillVisible) break;
    }
    await this.page.waitForTimeout(2000);
  }

  /** Delete via menu and confirm dialog */
  async deleteSong() {
    await this.openSongMenu();
    await this.songDelete.click();
    await this.page.waitForTimeout(500);
    await this.dialogConfirm.click();
    await this.page.waitForTimeout(2000);
  }
}
