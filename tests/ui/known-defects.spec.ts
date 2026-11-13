import { test, expect } from '../../src/fixtures/ui.fixtures';
import { checkoutInfo, users, type User } from '../../src/data/users';
import type { LoginPage } from '../../src/pages/LoginPage';
import type { InventoryPage } from '../../src/pages/InventoryPage';

/**
 * SauceDemo ships special users with deliberate defects. Each test below asserts the CORRECT
 * behaviour and is marked with `test.fail()` + a `bug` annotation, so:
 *  - the suite stays green while the defect exists (documented, not ignored),
 *  - the test turns red the moment a defect is fixed, prompting removal of the marker.
 * Every defect is reproduced side by side with standard_user, which must behave correctly.
 */

const brokenProducts = ['Sauce Labs Bolt T-Shirt', 'Sauce Labs Fleece Jacket', 'Test.allTheThings() T-Shirt (Red)'];

const knownBug = (description: string) => {
  test.fail(true, description);
  test.info().annotations.push({ type: 'bug', description });
};

async function loginAs(
  user: User,
  { loginPage, inventoryPage }: { loginPage: LoginPage; inventoryPage: InventoryPage },
) {
  await loginPage.goto();
  await loginPage.login(user);
  await inventoryPage.expectLoaded();
}

test.describe('Baseline: standard_user behaves correctly', () => {
  test('every product can be added to the cart', async ({ loginPage, inventoryPage }) => {
    await loginAs(users.standard, { loginPage, inventoryPage });
    for (const product of brokenProducts) await inventoryPage.addToCart(product);
    await expect(inventoryPage.cartBadge).toHaveText(String(brokenProducts.length));
  });

  test('every product has its own image', async ({ loginPage, inventoryPage, page }) => {
    await loginAs(users.standard, { loginPage, inventoryPage });
    const images = await page
      .locator('.inventory_item_img img')
      .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    expect(new Set(images).size).toBe(images.length);
  });
});

test.describe('Known defects: problem_user', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAs(users.problem, { loginPage, inventoryPage });
  });

  test('every product has its own image', async ({ page }) => {
    knownBug('problem_user: all products show the same image');
    const images = await page
      .locator('.inventory_item_img img')
      .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    expect(new Set(images).size).toBe(images.length);
  });

  test('sorting by name Z → A reorders the list', async ({ inventoryPage }) => {
    knownBug('problem_user: sorting has no effect');
    const before = await inventoryPage.getNames();
    await inventoryPage.sortBy('za');
    expect(await inventoryPage.getNames()).toEqual([...before].sort((a, b) => b.localeCompare(a)));
  });

  for (const product of brokenProducts) {
    test(`"${product}" can be added to the cart`, async ({ inventoryPage }) => {
      knownBug(`problem_user: "${product}" cannot be added to the cart`);
      await inventoryPage.addToCart(product);
      await expect(inventoryPage.cartBadge).toHaveText('1', { timeout: 2000 });
    });
  }

  test('last name field keeps what the user types', async ({ inventoryPage, cartPage, checkoutPage }) => {
    knownBug('problem_user: typing a last name overwrites the first name field');
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.firstName.fill(checkoutInfo.firstName);
    await checkoutPage.lastName.fill(checkoutInfo.lastName);

    await expect(checkoutPage.firstName).toHaveValue(checkoutInfo.firstName, { timeout: 2000 });
    await expect(checkoutPage.lastName).toHaveValue(checkoutInfo.lastName, { timeout: 2000 });
  });
});

test.describe('Known defects: error_user', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage }) => {
    page.on('dialog', (dialog) => dialog.dismiss());
    await loginAs(users.error, { loginPage, inventoryPage });
  });

  test('sorting works without an error dialog', async ({ page, inventoryPage }) => {
    knownBug('error_user: sorting shows "Sorting is broken!" alert');
    const dialog = page.waitForEvent('dialog', { timeout: 2000 }).then(
      (d) => d.message(),
      () => null,
    );
    await inventoryPage.sortBy('za');
    expect(await dialog).toBeNull();
  });

  for (const product of brokenProducts) {
    test(`adding "${product}" does not throw`, async ({ page, inventoryPage }) => {
      knownBug(`error_user: adding "${product}" throws "Failed to add item to the cart."`);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await inventoryPage.addToCart(product);

      expect(errors).toEqual([]);
      await expect(inventoryPage.cartBadge).toHaveText('1', { timeout: 2000 });
    });
  }

  test('last name field keeps what the user types', async ({ inventoryPage, cartPage, checkoutPage }) => {
    knownBug('error_user: last name field throws a JS error and stays empty');
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.lastName.fill(checkoutInfo.lastName);
    await expect(checkoutPage.lastName).toHaveValue(checkoutInfo.lastName, { timeout: 2000 });
  });

  test('checkout form is rejected without a last name', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    knownBug('error_user: the form is accepted although last name is empty');
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo({ ...checkoutInfo, lastName: '' });
    await expect(checkoutPage.error).toContainText('Last Name is required', { timeout: 2000 });
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('order can be finished', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    knownBug('error_user: Finish button throws a JS error and the order is never completed');
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(checkoutInfo);
    await expect(page).toHaveURL(/checkout-step-two/);

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!', { timeout: 3000 });
  });
});
