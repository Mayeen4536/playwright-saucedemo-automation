import type { EnvironmentName } from './environments';

export type ApiEnvironmentConfig = {
  apiBaseURL: string;
};

const DEFAULT_ENVIRONMENT: EnvironmentName = 'qa';

// restful-booker (https://restful-booker.herokuapp.com) is an independent
// public practice API used only for API-contract tests (tests/api/). It has
// no relationship to SauceDemo — the Step 1 network audit confirmed
// SauceDemo exposes no first-party API of its own — so this config is kept
// separate from environments.ts rather than folded into EnvironmentConfig.
// Like SauceDemo's own environments.ts, both qa/staging fall back to the
// same public instance today and are independently overridable later.
const apiEnvironments: Record<EnvironmentName, ApiEnvironmentConfig> = {
  qa: {
    apiBaseURL: process.env.QA_API_BASE_URL || 'https://restful-booker.herokuapp.com',
  },
  staging: {
    apiBaseURL: process.env.STAGING_API_BASE_URL || 'https://restful-booker.herokuapp.com',
  },
};

function isKnownEnvironment(name: string): name is EnvironmentName {
  return Object.prototype.hasOwnProperty.call(apiEnvironments, name);
}

/**
 * Resolves the active environment's API configuration from TEST_ENV — the
 * same variable environments.ts reads, so a single TEST_ENV selects both the
 * UI baseURL and the API baseURL together. Fails fast on an unknown
 * environment or missing configuration, mirroring getEnvironmentConfig().
 */
export function getApiEnvironmentConfig(): ApiEnvironmentConfig {
  const requested = process.env.TEST_ENV?.trim() || DEFAULT_ENVIRONMENT;

  if (!isKnownEnvironment(requested)) {
    const validNames = Object.keys(apiEnvironments).join(', ');
    throw new Error(
      `Unknown TEST_ENV "${requested}". Valid values are: ${validNames}.`
    );
  }

  const config = apiEnvironments[requested];

  if (!config.apiBaseURL) {
    throw new Error(`Missing apiBaseURL configuration for environment "${requested}".`);
  }

  return config;
}
