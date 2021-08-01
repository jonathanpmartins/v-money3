/**
 * @jest-environment puppeteer
 */

describe('Puppeteer Tests', () => {
  beforeAll(async () => {
    await page.goto('http://127.0.0.1:12345');
  });

  it('should test if it works', async () => {
    const value = '123456789';

    await page.focus('#component');
    await page.keyboard.type(value);

    const result = await page.$eval('#component', (input) => input.value);

    // Matcher error: received value must be a promise
    await expect(Promise.resolve(result)).resolves.toMatch('1,234,567.89');
  });
});
