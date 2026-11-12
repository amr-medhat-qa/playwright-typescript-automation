import { test, expect } from '../../src/fixtures/ui.fixtures';

test.describe('Inventory', () => {
  test('sort by name A → Z and Z → A', async ({ loggedIn }) => {
    await loggedIn.sortBy('az');
    const asc = await loggedIn.getNames();
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)));

    await loggedIn.sortBy('za');
    const desc = await loggedIn.getNames();
    expect(desc).toEqual([...asc].reverse());
  });

  test('sort by price low → high and high → low', async ({ loggedIn }) => {
    await loggedIn.sortBy('lohi');
    const lohi = await loggedIn.getPrices();
    expect(lohi).toEqual([...lohi].sort((a, b) => a - b));

    await loggedIn.sortBy('hilo');
    const hilo = await loggedIn.getPrices();
    expect(hilo).toEqual([...lohi].sort((a, b) => b - a));
  });

  test('cart badge reflects added and removed items @smoke', async ({ loggedIn }) => {
    await expect(loggedIn.cartBadge).toBeHidden();

    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveText('2');

    await loggedIn.removeFromCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
  });

  test('cart content persists after page reload', async ({ loggedIn, page, cartPage }) => {
    await loggedIn.addToCart('Sauce Labs Fleece Jacket');
    await page.reload();
    await expect(loggedIn.cartBadge).toHaveText('1');

    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Fleece Jacket']);
  });
});
