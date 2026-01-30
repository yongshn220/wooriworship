import { Page, Locator, expect } from '@playwright/test';

export class ServiceDetailPage {
  readonly page: Page;
  readonly teamId: string;

  // Service Detail
  readonly serviceDetail: Locator;
  readonly serviceInfoCard: Locator;

  // Section Cards (when data exists)
  readonly setlistCard: Locator;
  readonly praiseTeamCard: Locator;
  readonly serviceOrderCard: Locator;

  // Empty State Placeholders (when no data)
  readonly createSetlistPlaceholder: Locator;
  readonly createTeamPlaceholder: Locator;
  readonly createFlowPlaceholder: Locator;

  // Section Menu (three-dots dropdown on cards)
  readonly sectionMenu: Locator;
  readonly sectionEdit: Locator;
  readonly sectionDelete: Locator;

  // Forms
  readonly setlistForm: Locator;
  readonly praiseAssigneeForm: Locator;
  readonly serviceFlowForm: Locator;
  readonly formSubmit: Locator;
  readonly formClose: Locator;

  // Dialog
  readonly dialogConfirm: Locator;
  readonly dialogCancel: Locator;

  constructor(page: Page, teamId: string) {
    this.page = page;
    this.teamId = teamId;

    // Service Detail
    this.serviceDetail = page.locator('[data-testid="service-detail"]');
    this.serviceInfoCard = page.locator('[data-testid="service-info-card"]');

    // Section Cards
    this.setlistCard = page.locator('[data-testid="setlist-card"]');
    this.praiseTeamCard = page.locator('[data-testid="praise-team-card"]');
    this.serviceOrderCard = page.locator('[data-testid="service-order-card"]');

    // Empty State Placeholders
    this.createSetlistPlaceholder = page.locator('[data-testid="create-setlist-placeholder"]');
    this.createTeamPlaceholder = page.locator('[data-testid="create-team-placeholder"]');
    this.createFlowPlaceholder = page.locator('[data-testid="create-flow-placeholder"]');

    // Section Menu
    this.sectionMenu = page.locator('[data-testid="section-menu"]');
    this.sectionEdit = page.locator('[data-testid="section-edit"]');
    this.sectionDelete = page.locator('[data-testid="section-delete"]');

    // Forms
    this.setlistForm = page.locator('[data-testid="setlist-form"]');
    this.praiseAssigneeForm = page.locator('[data-testid="praise-assignee-form"]');
    this.serviceFlowForm = page.locator('[data-testid="service-flow-form"]');
    this.formSubmit = page.locator('[data-testid="form-submit"]');
    this.formClose = page.locator('[data-testid="form-close"]');

    // Dialog
    this.dialogConfirm = page.locator('[data-testid="dialog-confirm"]');
    this.dialogCancel = page.locator('[data-testid="dialog-cancel"]');
  }

  /** Navigate to service board */
  async goto() {
    await this.page.goto(`/board/${this.teamId}/service-board`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForFunction(
      () => {
        const hasCalendar = document.querySelector('[data-testid="calendar-strip"]');
        const hasEmptyState = document.querySelector('[class*="border-dashed"]');
        const noSpinner = document.querySelectorAll('[class*="animate-spin"]').length === 0;
        return (hasCalendar || hasEmptyState) && noSpinner;
      },
      { timeout: 30000 }
    );
  }

  /** Wait for service detail to appear */
  async expectDetailVisible() {
    await expect(this.serviceDetail).toBeVisible({ timeout: 15000 });
  }

  /** Check if a section has content or is showing empty placeholder */
  async hasSetlist(): Promise<boolean> {
    return await this.setlistCard.isVisible().catch(() => false);
  }

  async hasPraiseTeam(): Promise<boolean> {
    return await this.praiseTeamCard.isVisible().catch(() => false);
  }

  async hasFlow(): Promise<boolean> {
    return await this.serviceOrderCard.isVisible().catch(() => false);
  }

  // --- Setlist Actions ---

  /** Open setlist form by clicking placeholder or edit menu */
  async openSetlistForm() {
    const hasSetlist = await this.hasSetlist();
    if (hasSetlist) {
      // Click the section menu on the setlist card
      await this.setlistCard.locator('[data-testid="section-menu"]').click();
      await this.page.waitForTimeout(300);
      await this.sectionEdit.click();
    } else {
      await this.createSetlistPlaceholder.click();
    }
    await expect(this.setlistForm).toBeVisible({ timeout: 10000 });
  }

  /** Delete setlist via section menu */
  async deleteSetlist() {
    await this.setlistCard.locator('[data-testid="section-menu"]').click();
    await this.page.waitForTimeout(300);
    await this.sectionDelete.click();
    await this.page.waitForTimeout(500);
    await this.dialogConfirm.click();
    await this.page.waitForTimeout(2000);
  }

  // --- Praise Team Actions ---

  /** Open praise assignee form */
  async openPraiseAssigneeForm() {
    const hasPraise = await this.hasPraiseTeam();
    if (hasPraise) {
      await this.praiseTeamCard.locator('[data-testid="section-menu"]').click();
      await this.page.waitForTimeout(300);
      await this.sectionEdit.click();
    } else {
      await this.createTeamPlaceholder.click();
    }
    await expect(this.praiseAssigneeForm).toBeVisible({ timeout: 10000 });
  }

  /** Delete praise team via section menu */
  async deletePraiseTeam() {
    await this.praiseTeamCard.locator('[data-testid="section-menu"]').click();
    await this.page.waitForTimeout(300);
    await this.sectionDelete.click();
    await this.page.waitForTimeout(500);
    await this.dialogConfirm.click();
    await this.page.waitForTimeout(2000);
  }

  // --- Flow Actions ---

  /** Open service flow form */
  async openFlowForm() {
    const hasFlow = await this.hasFlow();
    if (hasFlow) {
      await this.serviceOrderCard.locator('[data-testid="section-menu"]').click();
      await this.page.waitForTimeout(300);
      await this.sectionEdit.click();
    } else {
      await this.createFlowPlaceholder.click();
    }
    await expect(this.serviceFlowForm).toBeVisible({ timeout: 10000 });
  }

  /** Delete flow via section menu */
  async deleteFlow() {
    await this.serviceOrderCard.locator('[data-testid="section-menu"]').click();
    await this.page.waitForTimeout(300);
    await this.sectionDelete.click();
    await this.page.waitForTimeout(500);
    await this.dialogConfirm.click();
    await this.page.waitForTimeout(2000);
  }

  /** Submit any currently open form */
  async submitForm() {
    await this.formSubmit.click();
    await this.page.waitForTimeout(2000);
  }

  /** Close any currently open form */
  async closeForm() {
    await this.formClose.click();
    await this.page.waitForTimeout(1000);
  }
}
