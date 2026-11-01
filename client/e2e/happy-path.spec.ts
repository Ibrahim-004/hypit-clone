import { test, expect } from '@playwright/test';

test('register, create, generate, edit, save', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project title').fill('E2E video');
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.getByText('E2E video').first().click();
  await expect(page).toHaveURL(/\/app\/projects\//);
  await page.getByLabel('Prompt').fill('A short cafe ad');
  await page.getByRole('button', { name: 'Generate scenes' }).click();
  await expect(page.getByText(/Generated \d+ scenes/)).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 30000 });
});
