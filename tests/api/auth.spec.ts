import { test, expect } from '../../src/fixtures/api.fixtures';

test.describe('Auth API', () => {
  test('health check responds @smoke', async ({ bookingClient }) => {
    const res = await bookingClient.ping();
    expect(res.status()).toBe(201);
  });

  test('valid credentials return a token @smoke', async ({ bookingClient }) => {
    const res = await bookingClient.createToken();
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(5);
  });

  test('invalid credentials do not return a token', async ({ bookingClient }) => {
    const res = await bookingClient.createToken('admin', 'wrong-password');
    // Restful-Booker answers 200 with a "reason" instead of 401 — documented quirk.
    const body = await res.json();
    expect(body).toEqual({ reason: 'Bad credentials' });
    expect(body.token).toBeUndefined();
  });
});
