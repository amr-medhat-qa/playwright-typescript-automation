export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

const firstNames = ['Amr', 'Sara', 'Omar', 'Mona', 'Youssef', 'Laila'];
const lastNames = ['Hassan', 'Ali', 'Mahmoud', 'Fathy', 'Nabil', 'Salem'];
const needs = ['Breakfast', 'Late checkout', 'Airport pickup', 'Extra bed'];

const pick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const isoDate = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

/** Builds a valid, randomized booking payload. Pass overrides to customise fields. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const nights = 1 + Math.floor(Math.random() * 7);
  const start = 1 + Math.floor(Math.random() * 30);
  return {
    firstname: pick(firstNames),
    lastname: `${pick(lastNames)}-${Date.now().toString(36)}`,
    totalprice: 100 + Math.floor(Math.random() * 900),
    depositpaid: Math.random() > 0.5,
    bookingdates: { checkin: isoDate(start), checkout: isoDate(start + nights) },
    additionalneeds: pick(needs),
    ...overrides,
  };
}
