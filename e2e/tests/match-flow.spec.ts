import { test, expect } from '@playwright/test';

test.describe('Match Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('verified@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create a new match', async ({ page }) => {
    // Navigate to matches
    await page.getByRole('link', { name: /matches/i }).click();
    await expect(page).toHaveURL(/\/matches/);

    // Click create match button
    await page.getByRole('button', { name: /create match/i }).click();

    // Fill in match details
    await page.getByLabel(/game/i).selectOption('Fortnite');
    await page.getByLabel(/wager amount/i).fill('100');
    await page.getByLabel(/team size/i).selectOption('SOLO');
    await page.getByLabel(/platform/i).selectOption('PC');
    await page.getByLabel(/region/i).selectOption('NA_EAST');

    // Submit form
    await page.getByRole('button', { name: /create/i }).click();

    // Should show success message
    await expect(page.getByText(/match created/i)).toBeVisible();
  });

  test('should browse and filter matches', async ({ page }) => {
    await page.goto('/matches');

    // Check matches are displayed
    await expect(page.getByText(/available matches/i)).toBeVisible();

    // Apply filters
    await page.getByLabel(/game/i).selectOption('Fortnite');
    await page.getByLabel(/wager/i).fill('50-200');

    // Click filter button
    await page.getByRole('button', { name: /filter/i }).click();

    // Should show filtered results
    await expect(page.getByTestId('match-card')).toHaveCount.greaterThan(0);
  });

  test('should join an open match', async ({ page }) => {
    await page.goto('/matches');

    // Find and click on an open match
    const matchCard = page.getByTestId('match-card').first();
    await matchCard.click();

    // Should navigate to match details
    await expect(page).toHaveURL(/\/matches\/[a-z0-9-]+/);

    // Click join button
    await page.getByRole('button', { name: /join match/i }).click();

    // Confirm join
    await page.getByRole('button', { name: /confirm/i }).click();

    // Should show success message
    await expect(page.getByText(/joined match/i)).toBeVisible();
  });

  test('should mark ready in lobby', async ({ page }) => {
    // Assuming user is in a match lobby
    await page.goto('/matches/test-match-id/lobby');

    // Click ready button
    await page.getByRole('button', { name: /ready/i }).click();

    // Should show ready status
    await expect(page.getByText(/you are ready/i)).toBeVisible();
  });

  test('should report match result', async ({ page }) => {
    // Navigate to in-progress match
    await page.goto('/matches/test-match-id');

    // Click report result button
    await page.getByRole('button', { name: /report result/i }).click();

    // Select winner
    await page.getByLabel(/winner/i).selectOption('TEAM_A');

    // Upload proof (optional)
    await page.getByLabel(/screenshot/i).setInputFiles('test-screenshot.png');

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show success message
    await expect(page.getByText(/result reported/i)).toBeVisible();
  });

  test('should file a dispute', async ({ page }) => {
    await page.goto('/matches/test-match-id');

    // Click dispute button
    await page.getByRole('button', { name: /dispute/i }).click();

    // Fill in dispute reason
    await page.getByLabel(/reason/i).fill('Opponent left the match early');

    // Upload evidence
    await page.getByLabel(/evidence/i).setInputFiles('test-evidence.mp4');

    // Submit dispute
    await page.getByRole('button', { name: /submit dispute/i }).click();

    // Should show confirmation
    await expect(page.getByText(/dispute filed/i)).toBeVisible();
  });

  test('should view match history', async ({ page }) => {
    await page.goto('/profile');

    // Click match history tab
    await page.getByRole('tab', { name: /match history/i }).click();

    // Should show past matches
    await expect(page.getByTestId('match-history-item')).toHaveCount.greaterThan(0);
  });
});
