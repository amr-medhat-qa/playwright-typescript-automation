import { test, expect } from '../../src/fixtures/ui.fixtures';
import { users } from '../../src/data/users';

/**
 * Visual regression tests.
 * Screenshots depend on OS fonts and rendering, so baselines live in __screenshots__ and are
 * generated on Linux in CI. Locally (Windows/macOS) these tests are skipped.
 */
// eslint-disable-next-line playwright/no-skipped-test -- intentional: platform-specific baselines
test.skip(
  process.platform !== 'linux' && !process.env.VISUAL_FORCE,
  'Visual baselines are generated and compared on Linux (CI). Set VISUAL_FORCE=1 to run anyway.',
);

test.describe('Visual regression', () => {
  test('login page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login.png');
  });

  test('login page with validation error', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut);
    await expect(loginPage.error).toBeVisible();
    await expect(page).toHaveScreenshot('login-error.png');
  });

  test('inventory page', async ({ loggedIn, page }) => {
    await expect(loggedIn.items).toHaveCount(6);
    await expect(page).toHaveScreenshot('inventory.png', { fullPage: true });
  });

  test('cart with items', async ({ loggedIn, cartPage, page }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await loggedIn.openCart();
    await expect(cartPage.items).toHaveCount(2);
    await expect(page).toHaveScreenshot('cart.png');
  });

  test('single product card', async ({ loggedIn }) => {
    await expect(loggedIn.items.first()).toHaveScreenshot('product-card.png');
  });
});

/**
 * `visual_user` shows the same inventory with visual defects (wrong images, misaligned elements).
 * Every functional check passes for this user — only a visual comparison catches it.
 * The test is expected to fail against the standard baseline, proving the visual suite detects it;
 * the diff image is attached to the report.
 */
test.describe('Visual bug detection', () => {
  test('visual_user inventory differs from the baseline @known-visual-bug', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    test.fail(true, 'visual_user intentionally renders visual defects');

    await loginPage.goto();
    await loginPage.login(users.visual);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6); // functionally identical...

    await expect(page).toHaveScreenshot('inventory.png', { fullPage: true }); // ...visually different
  });
});
