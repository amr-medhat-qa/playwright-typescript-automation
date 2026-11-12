import { test, expect } from '../../src/fixtures/ui.fixtures';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked out user sees an error', async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut);
    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory/);
  });

  const invalidCases = [
    { name: 'empty username', user: { username: '', password: 'secret_sauce' }, error: 'Username is required' },
    { name: 'empty password', user: { username: 'standard_user', password: '' }, error: 'Password is required' },
    {
      name: 'wrong password',
      user: { username: 'standard_user', password: 'wrong' },
      error: 'Username and password do not match any user in this service',
    },
  ];

  for (const { name, user, error } of invalidCases) {
    test(`shows validation error for ${name}`, async ({ loginPage }) => {
      await loginPage.login(user);
      await expect(loginPage.error).toContainText(error);
    });
  }

  test('protected page redirects to login when not authenticated', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
