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

      expect(value).toBe(`12,345${decimal}67`);
    }
  });

  it('Test precision attribute', async () => {
    const number = 1234567891234;

    for (let precision = 0; precision < 10; precision += 1) {
      await page.goto(`${serverUrl}?thousands=empty&precision=${precision}`);

      await page.focus('#component');
      await page.type('#component', `${number}`);

      const value = await page.$eval('#component', (input) => input.value);

      const toBe = (number / (10 ** precision)).toFixed(precision);

      expect(value).toBe(`${toBe}`);
    }
  });

  it('Test default integer model', async () => {
    await page.goto(`${serverUrl}?amount=12`);

    const value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('12.00');
  });

  it('Test default float model', async () => {
    await page.goto(`${serverUrl}?amount=12.1`);

    const value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('12.10');
  });

  it('Test disable-negative attribute', async () => {
    let value;

    await page.goto(`${serverUrl}`);

    await page.focus('#component');
    await page.type('#component', '62185');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('621.85');

    await page.type('#component', '-');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('-621.85');

    // ---------

    await page.goto(`${serverUrl}?disableNegative=true`);

    await page.focus('#component');
    await page.type('#component', '35684');

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('356.84');

    await page.type('#component', '-');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('356.84');
  });

  it('Test disable attribute', async () => {
    await page.goto(`${serverUrl}?disabled=true`);

    const isDisabled = await page.$eval('#component', (input) => input.disabled);

    expect(isDisabled).toBe(true);
  });

  it('Test min attribute', async () => {
    let value;
    const min = 3;

    await page.goto(`${serverUrl}?min=${min}`);

    await page.focus('#component');
    await page.keyboard.press('ArrowLeft');
    await page.type('#component', '1');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('30.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await page.type('#component', '2');
    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('320.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('20.10');

    await page.keyboard.press('Delete');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('3.00');
  });

  it('Test max attribute', async () => {
    let value;
    const max = 10;

    await page.goto(`${serverUrl}?max=${max}`);

    await page.focus('#component');
    await page.type('#component', '123');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('1.23');

    await page.type('#component', '4');

    value = await page.$eval('#component', (input) => input.value);
    expect(value).toBe('10.00');
  });

  it('Test allow-blank attribute', async () => {
    let value;

    await page.goto(`${serverUrl}?allowBlank=true`);

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('');

    await page.focus('#component');
    await page.type('#component', '5');

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('0.05');

    await page.keyboard.press('Backspace');

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('');

    await page.type('#component', '6');

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('0.06');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    value = await page.$eval('#component', (input) => input.value);

    expect(value).toBe('');
  });
});
