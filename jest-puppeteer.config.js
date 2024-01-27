module.exports = {
  server: {
    command: './node_modules/vite/bin/vite.js --host=127.0.0.1 --port=12345',
    port: 12345,
    launchTimeout: 10000,
  },
  launch: {
    headless: process.env.HEADLESS !== "false" ? "new" : false,
    slowMo: 10,
    product: 'chrome',
  },
  browserContext: 'default',
};
