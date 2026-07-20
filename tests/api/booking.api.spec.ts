import { test, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../api/clients/restfulBookerClient';
import type { CreateBookingRequest } from '../../api/types/booking';

const newBooking: CreateBookingRequest = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
  additionalneeds: 'Breakfast',
};

// Independent API-contract tests against restful-booker. Not connected to
// SauceDemo in any way — see README.md's "API Testing" section for why.
test.describe('restful-booker API — bookings', () => {
  test('creating a booking echoes the submitted fields under a generated id', async ({ request }) => {
    const client = new RestfulBookerClient(request);

    const response = await client.createBooking(newBooking);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    // bookingid is server-generated and different on every run — assert its
    // type, never its exact value.
    expect(typeof body.bookingid).toBe('number');
    // The booking object is fully within our control (we sent it), so an
    // exact match is not overfitting — it verifies the API stores and
    // returns every field, with its original type, without silent coercion.
    expect(body.booking).toEqual(newBooking);
  });

  test('fetching a non-existent booking id returns 404, not a booking payload', async ({ request }) => {
    const client = new RestfulBookerClient(request);

    const response = await client.getBooking(999999999);

    expect(response.status()).toBe(404);
    // A 404 here is plain text, not JSON. Checking content type (not just
    // status) guards against a regression where an unknown id starts
    // leaking a JSON body — booking data or otherwise.
    expect(response.headers()['content-type']).not.toContain('application/json');
  });
});
