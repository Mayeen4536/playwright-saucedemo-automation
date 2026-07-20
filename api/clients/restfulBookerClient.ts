import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { AuthRequest } from '../types/auth';
import type { CreateBookingRequest } from '../types/booking';

/**
 * Thin wrapper over Playwright's APIRequestContext for restful-booker.
 * Builds requests and returns the raw APIResponse — it does not read the
 * body, parse JSON, or assert anything. Specs decide what to inspect and
 * what "correct" means, the same separation LoginPage keeps from tests.
 */
export class RestfulBookerClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(credentials: AuthRequest): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  createBooking(payload: CreateBookingRequest): Promise<APIResponse> {
    return this.request.post('/booking', { data: payload });
  }

  getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }
}
