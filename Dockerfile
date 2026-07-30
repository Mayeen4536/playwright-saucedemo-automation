# Exact version match required: Playwright locates browser binaries by
# version, and this tag must match the installed @playwright/test version
# (confirmed against node_modules/@playwright/test/package.json). Never
# use :latest — it currently points at a materially newer Playwright
# release than this project uses.
FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Manifests copied first so this layer only rebuilds when dependencies
# actually change - editing a test file won't force a fresh npm ci.
COPY package.json package-lock.json ./
RUN npm ci

# Everything else the suite needs (config/, pages/, tests/, api/,
# playwright.config.ts). See .dockerignore for what's deliberately left
# out — host-only artifacts, secrets, and generated output never reach
# this layer in the first place.
COPY . .

# Same command already used outside Docker - no Docker-specific test
# logic. Environment selection (TEST_ENV), authentication-state
# generation (the 'setup' project), and every reporter/diagnostic stay
# exactly as configured in playwright.config.ts, driven entirely by
# environment variables passed at `docker run` time.
CMD ["npm", "test"]
