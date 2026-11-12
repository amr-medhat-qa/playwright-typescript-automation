import { test, expect } from '../../src/fixtures/api.fixtures';
import { buildBooking } from '../../src/data/bookingFactory';

test.describe('Booking API - CRUD', () => {
  test('create booking returns id and echoes payload @smoke', async ({ bookingClient }) => {
    const payload = buildBooking();
    const res = await bookingClient.create(payload);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toEqual(payload);
  });

  test('get booking by id returns the stored booking', async ({ bookingClient }) => {
    const payload = buildBooking();
    const { bookingid } = await (await bookingClient.create(payload)).json();

    const res = await bookingClient.get(bookingid);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  test('booking ids can be filtered by name', async ({ bookingClient }) => {
    const payload = buildBooking();
    const { bookingid } = await (await bookingClient.create(payload)).json();

    const res = await bookingClient.list({ firstname: payload.firstname, lastname: payload.lastname });
    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(bookingid);
  });

  test('full update (PUT) with token replaces the booking', async ({ bookingClient, token }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();
    const updated = buildBooking({ firstname: 'Updated', depositpaid: true });

    const res = await bookingClient.update(bookingid, updated, token);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);

    const fetched = await (await bookingClient.get(bookingid)).json();
    expect(fetched).toEqual(updated);
  });

  test('partial update (PATCH) changes only given fields', async ({ bookingClient, token }) => {
    const original = buildBooking();
    const { bookingid } = await (await bookingClient.create(original)).json();

    const res = await bookingClient.partialUpdate(bookingid, { totalprice: 4242, additionalneeds: 'None' }, token);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...original, totalprice: 4242, additionalneeds: 'None' });
  });

  test('delete booking removes it', async ({ bookingClient, token }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();

    const del = await bookingClient.delete(bookingid, token);
    expect(del.status()).toBe(201); // API returns 201 Created on delete — documented quirk

    const get = await bookingClient.get(bookingid);
    expect(get.status()).toBe(404);
  });
});

test.describe('Booking API - negative', () => {
  test('update without token is forbidden', async ({ bookingClient }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();
    const res = await bookingClient.update(bookingid, buildBooking());
    expect(res.status()).toBe(403);
  });

  test('delete with invalid token is forbidden', async ({ bookingClient }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();
    const res = await bookingClient.delete(bookingid, 'not-a-real-token');
    expect(res.status()).toBe(403);
  });

  test('get non-existing booking returns 404', async ({ bookingClient }) => {
    const res = await bookingClient.get(999_999_999);
    expect(res.status()).toBe(404);
  });
});
