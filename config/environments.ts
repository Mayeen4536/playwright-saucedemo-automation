export type EnvironmentName = 'qa' | 'staging';

export type EnvironmentConfig = {
  baseURL: string;
};

const DEFAULT_ENVIRONMENT: EnvironmentName = 'qa';

// SauceDemo only has one public instance today, so both environments fall
// back to it. Each is independently overridable once a real qa/staging
// deployment exists, without touching any other environment's value.
const environments: Record<EnvironmentName, EnvironmentConfig> = {
  qa: {
    baseURL: process.env.QA_BASE_URL || 'https://www.saucedemo.com/',
  },
  staging: {
    baseURL: process.env.STAGING_BASE_URL || 'https://www.saucedemo.com/',
  },
};

function isKnownEnvironment(name: string): name is EnvironmentName {
  return Object.prototype.hasOwnProperty.call(environments, name);
}

/**
 * Resolves the active environment's configuration from TEST_ENV.
 * Fails fast (throws) on an unknown environment name or missing required
 * configuration, rather than letting an undefined value reach the browser.
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const requested = process.env.TEST_ENV?.trim() || DEFAULT_ENVIRONMENT;

  if (!isKnownEnvironment(requested)) {
    const validNames = Object.keys(environments).join(', ');
    throw new Error(
      `Unknown TEST_ENV "${requested}". Valid values are: ${validNames}.`
    );
  }

  const config = environments[requested];

  if (!config.baseURL) {
    throw new Error(`Missing baseURL configuration for environment "${requested}".`);
  }

  return config;
}
