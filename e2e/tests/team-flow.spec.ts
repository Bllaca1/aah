import { test, expect } from '@playwright/test';

test.describe('Team Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('verified@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create a new team', async ({ page }) => {
    await page.goto('/teams');

    // Click create team button
    await page.getByRole('button', { name: /create team/i }).click();

    // Fill in team details
    const timestamp = Date.now();
    await page.getByLabel(/team name/i).fill(`Test Team ${timestamp}`);
    await page.getByLabel(/team tag/i).fill(`TT${timestamp}`);
    await page.getByLabel(/description/i).fill('A test team for E2E testing');

    // Submit form
    await page.getByRole('button', { name: /create/i }).click();

    // Should show success and navigate to team page
    await expect(page.getByText(/team created/i)).toBeVisible();
    await expect(page).toHaveURL(/\/teams\/[a-z0-9-]+/);
  });

  test('should invite friends to team', async ({ page }) => {
    await page.goto('/teams/test-team-id');

    // Click invite button
    await page.getByRole('button', { name: /invite members/i }).click();

    // Search for friend
    await page.getByLabel(/search/i).fill('friend@example.com');

    // Select friend from results
    await page.getByText('friend@example.com').click();

    // Send invite
    await page.getByRole('button', { name: /send invite/i }).click();

    // Should show success
    await expect(page.getByText(/invite sent/i)).toBeVisible();
  });

  test('should accept team invite', async ({ page }) => {
    await page.goto('/notifications');

    // Find team invite notification
    const invite = page.getByText(/invited you to join/i);
    await expect(invite).toBeVisible();

    // Click accept button
    await page.getByRole('button', { name: /accept/i }).first().click();

    // Should show success
    await expect(page.getByText(/joined team/i)).toBeVisible();
  });

  test('should view team stats', async ({ page }) => {
    await page.goto('/teams/test-team-id');

    // Check stats are displayed
    await expect(page.getByText(/team stats/i)).toBeVisible();
    await expect(page.getByText(/wins/i)).toBeVisible();
    await expect(page.getByText(/losses/i)).toBeVisible();
    await expect(page.getByText(/elo rating/i)).toBeVisible();
  });

  test('should leave team', async ({ page }) => {
    await page.goto('/teams/test-team-id');

    // Click leave team button
    await page.getByRole('button', { name: /leave team/i }).click();

    // Confirm leaving
    await page.getByRole('button', { name: /confirm/i }).click();

    // Should show success and redirect
    await expect(page.getByText(/left team/i)).toBeVisible();
    await expect(page).toHaveURL(/\/teams/);
  });

  test('should create team match', async ({ page }) => {
    await page.goto('/teams/test-team-id');

    // Click create match button
    await page.getByRole('button', { name: /create team match/i }).click();

    // Fill in match details
    await page.getByLabel(/game/i).selectOption('CS2');
    await page.getByLabel(/wager amount/i).fill('500');
    await page.getByLabel(/team size/i).selectOption('TEAM'); // 5v5

    // Submit
    await page.getByRole('button', { name: /create/i }).click();

    // Should show success
    await expect(page.getByText(/match created/i)).toBeVisible();
  });
});
