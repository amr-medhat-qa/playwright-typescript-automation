import { test, expect } from '../../src/fixtures/ui.fixtures';
import { users } from '../../src/data/users';
import { expectNoWcagViolations, expectOnlyKnownBestPracticeIssues } from '../../src/utils/a11y';

/**
 * Known best-practice findings on SauceDemo (not WCAG failures):
 * - page-has-heading-one: no <h1> on any page
 * - region: login page content is not inside a landmark
 */
const KNOWN = {
  login: ['page-has-heading-one', 'region'],
  app: ['page-has-heading-one'],
};

test.describe('Accessibility - WCAG 2.1 AA', () => {
  test('login page @smoke', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await expectNoWcagViolations(page, testInfo, 'login');
  });

  test('login page with error message', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut);
    await expect(loginPage.error).toBeVisible();
    await expectNoWcagViolations(page, testInfo, 'login-error');
  });

  test('inventory page', async ({ loggedIn, page }, testInfo) => {
    await expect(loggedIn.items.first()).toBeVisible();
    await expectNoWcagViolations(page, testInfo, 'inventory');
  });

  test('cart and checkout pages', async ({ loggedIn, cartPage, checkoutPage, page }, testInfo) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await expectNoWcagViolations(page, testInfo, 'cart');

    await cartPage.checkout();
    await expect(checkoutPage.firstName).toBeVisible();
    await expectNoWcagViolations(page, testInfo, 'checkout-info');
  });
});

test.describe('Accessibility - best practices (tracked)', () => {
  test('login page has only known issues', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await expectOnlyKnownBestPracticeIssues(page, testInfo, 'login', KNOWN.login);
  });

  test('inventory page has only known issues', async ({ loggedIn, page }, testInfo) => {
    await expect(loggedIn.items.first()).toBeVisible();
    await expectOnlyKnownBestPracticeIssues(page, testInfo, 'inventory', KNOWN.app);
  });
});

test.describe('Accessibility - keyboard', () => {
  test('user can log in using only the keyboard', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();

    await loginPage.username.focus();
    await page.keyboard.type(users.standard.username);
    await page.keyboard.press('Tab');
    await expect(loginPage.password).toBeFocused();
    await page.keyboard.type(users.standard.password);
    await page.keyboard.press('Enter');

    await inventoryPage.expectLoaded();
  });

  test('form fields expose accessible names', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  });
});
