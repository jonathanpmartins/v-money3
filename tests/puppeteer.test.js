/**
 * @jest-environment puppeteer
 */

describe('Puppeteer Tests', () => {
  const serverUrl = 'http://127.0.0.1:12345';

  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  it('Test prefix attribute', async () => {
    const data = ['R$ ', '$', '€', '₿', '1\\', '2\\'];

    for (const prefix of data) {
      await page.goto(`${serverUrl}?prefix=${prefix.replace(' ', '+')}`);

      await page.focus('#component');
      await page.type('#component', '12345');

      const value = await page.$eval('#component', (input) => input.value);

      expect(value).toBe(`${prefix}123.45`);
    }
  });

  it('Test suffix attribute', async () => {
    const data = ['#', '%', '$', '€', '₿', '.00', '($)', '/3'];

    for (const suffix of data) {
      const treated = suffix
        .replace('%', '%25')
        .replace('#', '%23');

      await page.goto(`${serverUrl}?suffix=${treated}`);

      await page.focus('#component');
      await page.type('#component', '123456');

      const value = await page.$eval('#component', (input) => input.value);

      expect(value).toBe(`1,234.56${suffix}`);
    }
  });
});
