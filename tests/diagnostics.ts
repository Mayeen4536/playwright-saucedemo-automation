import type { Page } from '@playwright/test';

// Bounds how much any single test can accumulate — evidence for a failing
// test, not a general-purpose log of everything the page ever did.
const MAX_ENTRIES_PER_CATEGORY = 20;

export type ConsoleErrorEvidence = {
  text: string;
};

export type FailedRequestEvidence = {
  method: string;
  url: string;
  resourceType: string;
  // Present for a response that came back with a client/server error status.
  status?: number;
  statusText?: string;
  // Present for a request that failed at the network level (DNS, connection
  // refused, aborted) and never produced a response at all.
  failureReason?: string;
};

export type BrowserDiagnostics = {
  consoleErrors: ConsoleErrorEvidence[];
  failedRequests: FailedRequestEvidence[];
};

export function hasEvidence(diagnostics: BrowserDiagnostics): boolean {
  return diagnostics.consoleErrors.length > 0 || diagnostics.failedRequests.length > 0;
}

/**
 * Strips query strings before a URL is ever stored. This app doesn't put
 * anything sensitive in one today, but a diagnostics fixture shouldn't
 * assume that stays true forever — a token or credential passed as a query
 * parameter must never end up in an attached artifact.
 */
export function sanitizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return url.search ? `${url.origin}${url.pathname} [query redacted]` : `${url.origin}${url.pathname}`;
  } catch {
    return '[unparseable URL]';
  }
}

function pushBounded<T>(list: T[], item: T): void {
  list.push(item);
  if (list.length > MAX_ENTRIES_PER_CATEGORY) {
    list.shift();
  }
}

/**
 * Wires console-error and failed-network-request listeners onto a page and
 * returns the live collection they write into. Deliberately narrow: only
 * console messages of type 'error' (not log/info/warning — most of those are
 * routine, not evidence of anything) and only network activity that actually
 * failed (network-level failures, or responses with a 4xx/5xx status) — never
 * the hundreds of successful requests a normal page load makes. Never reads
 * headers, cookies, or request/response bodies, so there's nothing sensitive
 * to redact from them — they're simply never collected.
 */
export function collectBrowserDiagnostics(page: Page): BrowserDiagnostics {
  const diagnostics: BrowserDiagnostics = {
    consoleErrors: [],
    failedRequests: [],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      pushBounded(diagnostics.consoleErrors, { text: message.text() });
    }
  });

  page.on('requestfailed', (request) => {
    pushBounded(diagnostics.failedRequests, {
      method: request.method(),
      url: sanitizeUrl(request.url()),
      resourceType: request.resourceType(),
      failureReason: request.failure()?.errorText,
    });
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      pushBounded(diagnostics.failedRequests, {
        method: response.request().method(),
        url: sanitizeUrl(response.url()),
        resourceType: response.request().resourceType(),
        status: response.status(),
        statusText: response.statusText(),
      });
    }
  });

  return diagnostics;
}
