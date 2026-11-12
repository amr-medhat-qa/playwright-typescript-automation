import { test as base } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';

type ApiFixtures = {
  bookingClient: BookingClient;
  token: string;
};

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request }, use) => use(new BookingClient(request)),
  token: async ({ bookingClient }, use) => use(await bookingClient.getToken()),
});

export { expect } from '@playwright/test';
