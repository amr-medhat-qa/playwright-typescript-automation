import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type { Booking } from '../data/bookingFactory';

/**
 * Thin client over the Restful-Booker API (https://restful-booker.herokuapp.com/apidoc).
 * Returns raw APIResponse objects so tests stay in control of status-code assertions.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async createToken(
    username = process.env.BOOKER_USERNAME ?? 'admin',
    password = process.env.BOOKER_PASSWORD ?? 'password123',
  ): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** Convenience: returns a valid token or throws. */
  async getToken(): Promise<string> {
    const res = await this.createToken();
    const body = await res.json();
    if (!body.token) throw new Error(`Auth failed: ${JSON.stringify(body)}`);
    return body.token;
  }

  async list(params?: Record<string, string>) {
    return this.request.get('/booking', { params });
  }

  async get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  async create(booking: Booking) {
    return this.request.post('/booking', { data: booking });
  }

  async update(id: number, booking: Booking, token?: string) {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.auth(token) });
  }

  async partialUpdate(id: number, patch: Partial<Booking>, token?: string) {
    return this.request.patch(`/booking/${id}`, { data: patch, headers: this.auth(token) });
  }

  async delete(id: number, token?: string) {
    return this.request.delete(`/booking/${id}`, { headers: this.auth(token) });
  }

  async ping() {
    return this.request.get('/ping');
  }

  private auth(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
