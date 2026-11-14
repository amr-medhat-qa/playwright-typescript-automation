import { test, expect } from '../../src/fixtures/ui.fixtures';
import { checkoutInfo, users } from '../../src/data/users';

/**
 * Runs on emulated phones (see `mobile-chrome` / `mobile-safari` projects):
 * real device viewport, user agent, device scale factor and touch support.
 */
test.describe('Mobile', () => {
  test('device is emulated as a touch phone', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);
    // Chromium reports maxTouchPoints; WebKit exposes the touch events API instead — either proves touch support
    expect(await page.evaluate(() => navigator.maxTouchPoints > 0 || 'ontouchstart' in window)).toBe(true);
    expect(await page.evaluate(() => navigator.userAgent)).toMatch(/Mobile/);
  });

  test('user can log in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('products are shown in a single column without horizontal scrolling', async ({ loggedIn, page }) => {
    const lefts = await loggedIn.items.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(lefts).size, 'all product cards share one column').toBe(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'page must not scroll sideways').toBeLessThanOrEqual(0);
  });

  test('add to cart with a tap', async ({ loggedIn, page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').tap();
    await page.getByTestId('add-to-cart-sauce-labs-bike-light').tap();
    await expect(loggedIn.cartBadge).toHaveText('2');
  });

  test('complete an order end to end @smoke', async ({ loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack']);

    await cartPage.checkout();
    await checkoutPage.fillInfo(checkoutInfo);
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test.describe('Hamburger menu', () => {
    test('opens and shows navigation links', async ({ loggedIn }) => {
      await loggedIn.openMenu();
      await expect(loggedIn.allItemsLink).toBeVisible();
      await expect(loggedIn.logoutLink).toBeVisible();
      await expect(loggedIn.resetAppLink).toBeVisible();
    });

    test('logout returns to the login page', async ({ loggedIn, loginPage, page }) => {
      await loggedIn.logout();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(page).not.toHaveURL(/inventory/);
    });

    test('reset app state empties the cart', async ({ loggedIn }) => {
      await loggedIn.addToCart('Sauce Labs Onesie');
      await expect(loggedIn.cartBadge).toHaveText('1');

      await loggedIn.openMenu();
      await loggedIn.resetAppLink.click();

      await expect(loggedIn.cartBadge).toBeHidden();
    });
  });
});
