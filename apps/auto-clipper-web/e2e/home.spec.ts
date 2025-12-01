import { test, expect } from '@playwright/test';

test('Auto Clipper Home Smoke Test', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Page Title
    await expect(page).toHaveTitle(/Auto-Clipper/);

    // 2. Check Input Field Availability
    const input = page.getByPlaceholder('YouTube URL を入力');
    await expect(input).toBeVisible();

    // 3. Type a Dummy URL
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // 4. Check Clip Button State
    // The button should be enabled or visible
    const clipButton = page.getByRole('button', { name: '動画を分析' });
    await expect(clipButton).toBeVisible();

    // Note: We avoid clicking it to prevent actual API calls in this smoke test
    // unless we mock the API route.
});
