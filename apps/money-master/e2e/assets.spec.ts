import { test, expect } from '@playwright/test';

test.describe('Asset Management Flow', () => {
    test('should allow a user to add a new cash asset', async ({ page }) => {
        // 1. Navigate to Assets page
        await page.goto('/assets');

        // Check if we are on the right page
        await expect(page.getByRole('heading', { level: 2 })).toContainText('資産一覧');

        // 2. Click Add Asset Button
        const addButton = page.locator('button').filter({ hasText: '資産を追加' }).first();
        await addButton.click();

        // 3. Verify Navigation to Add Page
        await expect(page).toHaveURL(/\/assets\/add/);
        await expect(page.getByRole('heading', { name: '資産を追加', level: 1 })).toBeVisible();

        // 4. Fill the Form
        await page.getByLabel('資産名').fill('E2E Test Fund');
        await page.getByLabel('コード/ティッカー').fill('E2E-001');

        // Select Asset Type
        await page.getByLabel('種類').selectOption('cash');

        await page.getByLabel('現在の価格').fill('10000');
        await page.getByLabel('保有数量').fill('1');

        // 5. Submit
        await page.getByRole('button', { name: '保存' }).click();

        // 6. Verify Redirect and New Asset
        await expect(page).toHaveURL(/\/assets/);
        await expect(page.getByText('E2E Test Fund')).toBeVisible();
    });
});
