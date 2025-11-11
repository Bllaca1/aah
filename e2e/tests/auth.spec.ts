import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/BetDuel/i);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!',
      displayName: 'Test User',
    };

    // Navigate to sign up
    await page.goto('/signup');

    // Fill in registration form
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).first().fill(testUser.password);
    await page.getByLabel(/confirm password/i).fill(testUser.password);
    await page.getByLabel(/display name/i).fill(testUser.displayName);

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show success message or redirect
    await expect(page.getByText(/verification email/i)).toBeVisible();
  });

  test('should show error for existing email', async ({ page }) => {
    await page.goto('/signup');

    // Try to register with existing email
    await page.getByLabel(/email/i).fill('existing@example.com');
    await page.getByLabel(/username/i).fill('newuser');
    await page.getByLabel(/password/i).first().fill('TestPassword123!');
    await page.getByLabel(/confirm password/i).fill('TestPassword123!');

    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show error message
    await expect(page.getByText(/email already exists/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.getByLabel(/email/i).fill('verified@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: /login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form with wrong credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');

    // Submit form
    await page.getByRole('button', { name: /login/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('verified@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Fill in email
    await page.getByLabel(/email/i).fill('test@example.com');

    // Submit form
    await page.getByRole('button', { name: /reset password/i }).click();

    // Should show success message
    await expect(page.getByText(/reset link sent/i)).toBeVisible();
  });
});
