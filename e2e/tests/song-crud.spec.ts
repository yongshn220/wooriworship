import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';
import { SongPage } from '../pages/song.page';

const TEAM_ID = process.env.E2E_TEAM_ID || '';
const TEST_SONG_TITLE = `E2E Test Song ${Date.now()}`;
const EDITED_SONG_TITLE = `E2E Edited Song ${Date.now()}`;

/**
 * Song CRUD E2E Tests
 *
 * Tests create, edit, and delete operations for songs.
 * Runs in serial mode — each test depends on the previous.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 */
test.describe('Song CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('create a new song', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    const songPage = new SongPage(page, TEAM_ID);

    // Navigate to song board
    await page.locator('[data-testid="nav-song"]').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/song-board/);

    // Navigate to create song page
    await songPage.gotoCreate();
    await songPage.expectFormVisible();

    // Fill title and submit through all steps
    await songPage.fillAndSubmit(TEST_SONG_TITLE);

    // Should redirect back to song board or show success
    await page.waitForTimeout(3000);

    // Navigate to song board to verify
    await songPage.goto();
    await page.waitForTimeout(3000);

    // The created song should appear
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(TEST_SONG_TITLE);
  });

  test('edit an existing song', async ({ page }) => {
    await login(page);

    const songPage = new SongPage(page, TEAM_ID);
    await songPage.goto();
    await page.waitForTimeout(3000);

    // Find and click on the test song to open detail
    const songItem = page.locator('[data-testid="song-item"]', { hasText: TEST_SONG_TITLE });
    await expect(songItem).toBeVisible({ timeout: 10000 });
    await songItem.click();
    await page.waitForTimeout(2000);

    // Should navigate to song detail page
    await expect(page).toHaveURL(/song-board\/.+/);

    // Open menu and click edit
    await songPage.openSongMenu();
    await songPage.songEdit.click();
    await page.waitForTimeout(2000);

    // Should navigate to edit page
    await expect(page).toHaveURL(/edit-song/);

    // Form should load with existing title
    await songPage.expectFormVisible();
    await page.waitForTimeout(1000);

    // Clear and type new title
    await songPage.titleInput.clear();
    await songPage.titleInput.fill(EDITED_SONG_TITLE);

    // Submit through all steps
    await songPage.fillAndSubmit(EDITED_SONG_TITLE);
    await page.waitForTimeout(3000);

    // Navigate to song board and verify
    await songPage.goto();
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(EDITED_SONG_TITLE);
  });

  test('delete a song', async ({ page }) => {
    await login(page);

    const songPage = new SongPage(page, TEAM_ID);
    await songPage.goto();
    await page.waitForTimeout(3000);

    // Find and click the edited test song
    const songItem = page.locator('[data-testid="song-item"]', { hasText: EDITED_SONG_TITLE });
    await expect(songItem).toBeVisible({ timeout: 10000 });
    await songItem.click();
    await page.waitForTimeout(2000);

    // Should be on song detail page
    await expect(page).toHaveURL(/song-board\/.+/);

    // Delete via menu
    await songPage.deleteSong();

    // Should navigate back to song board
    await page.waitForTimeout(3000);

    // Navigate to song board to verify deletion
    await songPage.goto();
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain(EDITED_SONG_TITLE);
  });
});
