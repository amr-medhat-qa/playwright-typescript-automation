import { test, expect } from '../../src/fixtures/ui.fixtures';
import { checkoutInfo } from '../../src/data/users';

const products = ['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt'];

test.describe('Checkout', () => {
  test('user can complete an order end to end @smoke', async ({ loggedIn, cartPage, checkoutPage }) => {
    for (const p of products) await loggedIn.addToCart(p);
    await loggedIn.openCart();

    await expect(cartPage.itemNames).toHaveText(products);
    await cartPage.checkout();

    await checkoutPage.fillInfo(checkoutInfo);

    const { prices, subtotal, tax, total } = await checkoutPage.getSummary();
    const expectedSubtotal = prices.reduce((sum, p) => sum + p, 0);
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(loggedIn.cartBadge).toBeHidden();
  });

  const requiredFields = [
    { info: { ...checkoutInfo, firstName: '' }, error: 'First Name is required' },
    { info: { ...checkoutInfo, lastName: '' }, error: 'Last Name is required' },
    { info: { ...checkoutInfo, postalCode: '' }, error: 'Postal Code is required' },
  ];

  for (const { info, error } of requiredFields) {
    test(`checkout form validates: ${error}`, async ({ loggedIn, cartPage, checkoutPage }) => {
      await loggedIn.addToCart(products[0]);
      await loggedIn.openCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo(info);
      await expect(checkoutPage.error).toContainText(error);
    });
  }
});
