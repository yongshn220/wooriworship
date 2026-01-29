import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Service Board.
 * Encapsulates selectors and actions for the service calendar view.
 */
export class ServiceBoardPage {
  readonly page: Page;

  // Calendar
  readonly calendarStrip: Locator;
  readonly calendarButton: Locator;

  // Service Detail
  readonly serviceDetail: Locator;
  readonly serviceInfoCard: Locator;
  readonly serviceLoading: Locator;

  // Empty State Placeholders
  readonly createSetlistPlaceholder: Locator;
  readonly createTeamPlaceholder: Locator;
  readonly createFlowPlaceholder: Locator;

  // Bottom Navigation
  readonly navNotice: Locator;
  readonly navService: Locator;
  readonly navSong: Locator;
  readonly navManage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Calendar
    this.calendarStrip = page.locator('[data-testid="calendar-strip"]');
    this.calendarButton = page.getByText('CALENDAR');

    // Service Detail
    this.serviceDetail = page.locator('[data-testid="service-detail"]');
    this.serviceInfoCard = page.locator('[data-testid="service-info-card"]');
    this.serviceLoading = page.locator('[data-testid="service-loading"]');

    // Empty State Placeholders
    this.createSetlistPlaceholder = page.locator('[data-testid="create-setlist-placeholder"]');
    this.createTeamPlaceholder = page.locator('[data-testid="create-team-placeholder"]');
    this.createFlowPlaceholder = page.locator('[data-testid="create-flow-placeholder"]');

    // Bottom Navigation
    this.navNotice = page.locator('[data-testid="nav-notice"]');
    this.navService = page.locator('[data-testid="nav-service"]');
    this.navSong = page.locator('[data-testid="nav-song"]');
    this.navManage = page.locator('[data-testid="nav-manage"]');
  }

  /** Wait for the page to finish loading (spinner gone, content visible) */
  async expectLoaded() {
    // navigateToTeam already waits for calendar-strip or empty state.
    // This is a secondary check for any remaining loading spinners.
    await expect(this.page.locator('[class*="animate-spin"]')).toBeHidden({ timeout: 15000 });
  }

  /** Wait for service detail section to appear */
  async expectDetailVisible() {
    await expect(this.serviceDetail).toBeVisible({ timeout: 15000 });
  }

  /** Get the service title from the info card */
  async getServiceTitle(): Promise<string> {
    const h1 = this.serviceInfoCard.locator('h1');
    return (await h1.textContent()) || '';
  }

  /** Get the service date string from the info card */
  async getServiceDate(): Promise<string> {
    const dateSpan = this.serviceInfoCard.locator('span.text-sm');
    return (await dateSpan.textContent()) || '';
  }

  /** Check which detail sections have content vs empty placeholders */
  async getSectionStates() {
    const hasSetlist = await this.createSetlistPlaceholder.isHidden().catch(() => true);
    const hasTeam = await this.createTeamPlaceholder.isHidden().catch(() => true);
    const hasFlow = await this.createFlowPlaceholder.isHidden().catch(() => true);
    return { hasSetlist, hasTeam, hasFlow };
  }
}
