import { defineConfig } from '@playwright/test'

const PORT = 8798

// Runs against the production build (`npm run build` first) with a throwaway database.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: {
    command: 'node --disable-warning=ExperimentalWarning server/index.js',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    env: { PORT: String(PORT), ADMIN_TOKEN: 'e2e-token', DATABASE_PATH: ':memory:' },
  },
})
