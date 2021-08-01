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

  it('Test thousands attribute', async () => {
    const data = [',', '.', '|', '#', ';'];

    for (const thousands of data) {
      const treated = thousands.replace('#', '%23');

      await page.goto(`${serverUrl}?thousands=${treated}`);

      await page.focus('#component');
      await page.type('#component', '9999999999999');

      const value = await page.$eval('#component', (input) => input.value);

      expect(value).toBe(`99${thousands}999${thousands}999${thousands}999.99`);
    }
  });

  it('Test decimal attribute', async () => {
    const data = [',', '.', '#', ';', '\'', '/'];

    for (const decimal of data) {
      const treated = decimal
        .replace('#', '%23')
        .replace(',', '%2C');

      await page.goto(`${serverUrl}?decimal=${treated}`);

      await page.focus('#component');
      await page.type('#component', '12345.67');

      const value = await page.$eval('#component', (input) => input.value);

      // await page.waitForResponse(30000);

      expect(value).toBe(`12,345${decimal}67`);
    }
  });
});
