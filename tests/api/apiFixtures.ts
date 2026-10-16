import { test as base, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../api/clients/restfulBookerClient';

type ApiFixtures = {
  bookerClient: RestfulBookerClient;
};

/**
 * Test extension for the API suite only. Kept apart from tests/fixtures.ts on
 * purpose: that file's automatic browserDiagnostics fixture depends on `page`,
 * so importing it here would launch a browser for every API test.
 *
 * `bookerClient` is test-scoped and depends on Playwright's built-in `request`,
 * which owns the APIRequestContext (baseURL from the 'api' project) and its
 * disposal. The client is a stateless wrapper, so there is nothing to tear down.
 */
export const test = base.extend<ApiFixtures>({
  bookerClient: async ({ request }, use) => {
    await use(new RestfulBookerClient(request));
  },
});

export { expect };
