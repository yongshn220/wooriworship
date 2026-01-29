import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Service Board.
 * Encapsulates selectors and actions for the service calendar view.
 */
export class ServiceBoardPage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly serviceCards: Locator;
  readonly createServiceButton: Locator;
  readonly calendarStrip: Locator;
  readonly bottomNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').first();
    this.serviceCards = page.locator('[data-testid^="service-card"]');
    this.createServiceButton = page.locator('[data-testid="create-service"], a[href*="create-service"]');
    this.calendarStrip = page.locator('[data-testid="calendar-strip"]');
    this.bottomNav = page.locator('nav');
  }

  async goto(teamId: string) {
    await this.page.goto(`/board/${teamId}/service-board`);
    await this.page.waitForLoadState('networkidle');
  }

  async getServiceCount() {
    return this.serviceCards.count();
  }

  async clickService(index: number) {
    await this.serviceCards.nth(index).click();
  }

  async clickCreateService() {
    await this.createServiceButton.click();
  }

  async expectLoaded() {
    // Page should not show loading spinner after load
    await expect(this.page.locator('[class*="animate-spin"]')).toBeHidden({ timeout: 10000 });
  }
}
