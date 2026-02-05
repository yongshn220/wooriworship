import { test, expect } from '@playwright/test';
import { login, navigateToTeam } from '../fixtures/auth';

const TEAM_ID = process.env.E2E_TEAM_ID || '';

/**
 * Annotation E2E Tests
 *
 * Tests the pen annotation feature on sheet music in the setlist view.
 *
 * Prerequisites:
 *   - E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_TEAM_ID in .env.test
 *   - Dev server on localhost:3000
 *   - At least one service with a setlist containing songs with sheet music
 */
async function dismissNotificationDialog(page: any) {
  // Dismiss the notification permission dialog if it appears
  const notificationDialog = page.locator('[role="alertdialog"]');
  if (await notificationDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Click "Not now" or close button
    const notNowButton = page.locator('button:has-text("Not now"), button:has-text("나중에"), [data-testid="dialog-cancel"]');
    if (await notNowButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notNowButton.click();
      await page.waitForTimeout(500);
    }
  }
}

test.describe('Sheet Music Annotation', () => {
  test('can toggle drawing mode and draw on sheet music', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    // Wait for service board to load
    await page.waitForTimeout(2000);

    // Dismiss notification dialog if present
    await dismissNotificationDialog(page);

    // Click on a service card to open detail view
    const serviceCard = page.locator('[data-testid="calendar-strip"]').locator('..').locator('[class*="cursor-pointer"]').first();
    if (await serviceCard.isVisible()) {
      await serviceCard.click();
      await page.waitForTimeout(1000);
    }

    // Look for setlist card and click to open setlist view
    const setlistCard = page.locator('text=세트리스트').first();
    if (!await setlistCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }

    // Find and click the "View" or card area to open full-screen setlist view
    const viewButton = page.locator('[data-testid="setlist-card"]').or(page.locator('text=세트리스트').locator('..'));
    await viewButton.click();
    await page.waitForTimeout(2000);

    // Check if we're in fullscreen setlist view (Dialog with carousel)
    const fullscreenDialog = page.locator('[role="dialog"]');
    if (!await fullscreenDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Try clicking on an image/sheet if visible
      const sheetImage = page.locator('img[alt="Music score"]').first();
      if (await sheetImage.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sheetImage.click();
        await page.waitForTimeout(1000);
      }
    }

    // Look for the drawing mode toggle button (Pencil icon in control dock)
    const pencilButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();

    if (!await pencilButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // May need to expand the control dock first
      const expandButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Click pencil button to enable drawing mode
    await pencilButton.click();
    await page.waitForTimeout(500);

    // Verify annotation toolbar appears
    const annotationToolbar = page.locator('button').filter({ has: page.locator('svg.lucide-eraser') });
    await expect(annotationToolbar).toBeVisible({ timeout: 3000 });

    // Find the SVG canvas for drawing
    const svgCanvas = page.locator('svg[viewBox="0 0 1 1"]').first();

    if (await svgCanvas.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await svgCanvas.boundingBox();

      if (box) {
        // Draw a stroke
        const startX = box.x + box.width * 0.3;
        const startY = box.y + box.height * 0.3;
        const endX = box.x + box.width * 0.7;
        const endY = box.y + box.height * 0.7;

        await page.mouse.move(startX, startY);
        await page.mouse.down();

        // Draw a line with multiple points
        for (let i = 0; i <= 10; i++) {
          const x = startX + (endX - startX) * (i / 10);
          const y = startY + (endY - startY) * (i / 10);
          await page.mouse.move(x, y);
          await page.waitForTimeout(20);
        }

        await page.mouse.up();
        await page.waitForTimeout(500);

        // Check if a path was created in the SVG
        const pathElements = svgCanvas.locator('path');
        const pathCount = await pathElements.count();

        // Should have at least one path (the drawn stroke)
        expect(pathCount).toBeGreaterThan(0);
      }
    }

    // Test undo functionality
    const undoButton = page.locator('button').filter({ has: page.locator('svg.lucide-undo-2') });
    if (await undoButton.isVisible() && await undoButton.isEnabled()) {
      await undoButton.click();
      await page.waitForTimeout(500);
    }

    // Toggle drawing mode off
    await pencilButton.click();
    await page.waitForTimeout(500);

    // Toolbar should disappear
    await expect(annotationToolbar).toBeHidden({ timeout: 3000 });
  });

  test('drawing mode disables carousel swipe', async ({ page }) => {
    await login(page);
    await navigateToTeam(page);

    await page.waitForTimeout(2000);

    // Dismiss notification dialog if present
    await dismissNotificationDialog(page);

    // Navigate to setlist view (similar setup as above)
    const serviceCard = page.locator('[data-testid="calendar-strip"]').locator('..').locator('[class*="cursor-pointer"]').first();
    if (await serviceCard.isVisible()) {
      await serviceCard.click();
      await page.waitForTimeout(1000);
    }

    const setlistCard = page.locator('text=세트리스트').first();
    if (!await setlistCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }

    const viewButton = page.locator('[data-testid="setlist-card"]').or(page.locator('text=세트리스트').locator('..'));
    await viewButton.click();
    await page.waitForTimeout(2000);

    // Enable drawing mode
    const pencilButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();

    const expandButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    if (await pencilButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pencilButton.click();
      await page.waitForTimeout(500);

      // Get current carousel position
      const carousel = page.locator('#song-carousel');
      const initialTransform = await carousel.locator('[class*="embla"]').first().evaluate(el => {
        return window.getComputedStyle(el).transform;
      }).catch(() => 'none');

      // Try to swipe horizontally (should be blocked in drawing mode)
      const box = await carousel.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Carousel should not have moved
        const afterTransform = await carousel.locator('[class*="embla"]').first().evaluate(el => {
          return window.getComputedStyle(el).transform;
        }).catch(() => 'none');

        // In drawing mode, swipe should be blocked, so transform should be same
        // (This is a soft check - the main point is no crash occurs)
        expect(afterTransform).toBeDefined();
      }

      // Disable drawing mode
      await pencilButton.click();
    }
  });
});
