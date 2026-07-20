import { test, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../api/clients/restfulBookerClient';
import { adminCredentials, invalidCredentials } from '../../api/test-data/bookerCredentials';

// Independent API-contract tests against restful-booker. Not connected to
// SauceDemo in any way — see README.md's "API Testing" section for why.
test.describe('restful-booker API — authentication', () => {
  test('valid credentials return a usable token', async ({ request }) => {
    const client = new RestfulBookerClient(request);

    const response = await client.createToken(adminCredentials);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    // The token itself is generated fresh every call — assert its type and
    // presence, never its exact value.
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('invalid credentials are rejected via the response body, not the status code', async ({ request }) => {
    const client = new RestfulBookerClient(request);

    const response = await client.createToken(invalidCredentials);

    // restful-booker responds 200 even when credentials are wrong — the
    // failure is only signalled by the response shape. Asserting status
    // alone would let a completely broken auth check pass silently.
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });
});
