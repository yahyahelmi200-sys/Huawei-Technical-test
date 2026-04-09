// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
  },

  // Jalankan server Task 1 otomatis sebelum tests dijalankan
  webServer: {
    command: 'node task1-backend/server.js',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 10000,
    env: { NODE_ENV: 'test' },
  },
});
