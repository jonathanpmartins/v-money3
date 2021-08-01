module.exports = {
  server: {
    command: './node_modules/vite/bin/vite.js --host=127.0.0.1 --port=12345',
    port: 12345,
  },
  launch: {
    // dumpio: true,
    // headless: process.env.HEADLESS !== 'false',
    headless: false,
    slowMo: 35,
    product: 'chrome',
  },
  browserContext: 'default',
};
