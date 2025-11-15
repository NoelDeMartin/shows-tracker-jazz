import { defineConfig, devices } from '@playwright/test';

// oxlint-disable-next-line sort-keys
export default defineConfig({
    testDir: './e2e/specs',
    fullyParallel: true,
    workers: 1,
    timeout: 10_000,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'list' : 'html',
    use: {
        baseURL: 'http://localhost:5173',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: !!process.env.CI,
            },
        },
        ...(process.env.CI
            ? [
                  {
                      name: 'firefox',
                      use: { ...devices['Desktop Firefox'] },
                  },
                  {
                      name: 'webkit',
                      use: { ...devices['Desktop Safari'] },
                  },
              ]
            : []),
    ],
    webServer: {
        command: 'pnpm dev',
        reuseExistingServer: !process.env.CI,
        url: 'http://localhost:5173',
    },
});
