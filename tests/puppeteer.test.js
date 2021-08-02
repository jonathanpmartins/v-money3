/**
 * @jest-environment puppeteer
 */

describe('Puppeteer Tests', () => {
  const serverUrl = 'http://127.0.0.1:12345';

  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  async function getValue() {
    return page.$eval('#component', (input) => input.value);
  }

  it('Test prefix attribute', async () => {
    const data = ['R$ ', '$', '€', '₿', '1\\', '2\\'];

    for (const prefix of data) {
      await page.goto(`${serverUrl}?prefix=${prefix.replaceAll(' ', '+')}`);

      await page.focus('#component');
      await page.type('#component', '12345');

      expect(await getValue()).toBe(`${prefix}123.45`);
    }
  });

  it('Test suffix attribute', async () => {
    const data = ['#', '%', '$', '€', '₿', '.00', '($)', '/3'];

    for (const suffix of data) {
      const treated = suffix
        .replaceAll('%', '%25')
        .replaceAll('#', '%23');

      await page.goto(`${serverUrl}?suffix=${treated}`);

      await page.focus('#component');
      await page.type('#component', '123456');

      expect(await getValue()).toBe(`1,234.56${suffix}`);
    }
  });

  it('Test thousands attribute', async () => {
    const data = [',', '.', '|', '#', ';'];

    for (const thousands of data) {
      const treated = thousands.replaceAll('#', '%23');

      await page.goto(`${serverUrl}?thousands=${treated}`);

      await page.focus('#component');
      await page.type('#component', '9999999999999');

      expect(await getValue()).toBe(`99${thousands}999${thousands}999${thousands}999.99`);
    }
  });

  it('Test decimal attribute', async () => {
    const data = [',', '.', '#', ';', '\'', '/'];

    for (const decimal of data) {
      const treated = decimal
        .replaceAll('#', '%23')
        .replaceAll(',', '%2C');

      await page.goto(`${serverUrl}?decimal=${treated}`);

      await page.focus('#component');
      await page.type('#component', '12345.67');

      expect(await getValue()).toBe(`12,345${decimal}67`);
    }
  });

  it('Test precision attribute', async () => {
    const number = 1234567891234;

    for (let precision = 0; precision < 10; precision += 1) {
      await page.goto(`${serverUrl}?thousands=empty&precision=${precision}`);

      await page.focus('#component');
      await page.type('#component', `${number}`);

      const value = await getValue();

      const toBe = (number / (10 ** precision)).toFixed(precision);

      expect(value).toBe(`${toBe}`);
    }
  });

  it('Test default integer model', async () => {
    await page.goto(`${serverUrl}?amount=12`);

    expect(await getValue()).toBe('12.00');
  });

  it('Test default float model', async () => {
    await page.goto(`${serverUrl}?amount=12.1`);

    expect(await getValue()).toBe('12.10');
  });

  it('Test disable-negative attribute', async () => {
    await page.goto(`${serverUrl}`);

    await page.focus('#component');
    await page.type('#component', '62185');

    expect(await getValue()).toBe('621.85');

    await page.type('#component', '-');

    expect(await getValue()).toBe('-621.85');

    // ---------

    await page.goto(`${serverUrl}?disableNegative=true`);

    await page.focus('#component');
    await page.type('#component', '35684');

    expect(await getValue()).toBe('356.84');

    await page.type('#component', '-');

    expect(await getValue()).toBe('356.84');
  });

  it('Test disable attribute', async () => {
    await page.goto(`${serverUrl}?disabled=true`);

    const isDisabled = await page.$eval('#component', (input) => input.disabled);

    expect(isDisabled).toBe(true);
  });

  it('Test min attribute', async () => {
    const min = 3;

    await page.goto(`${serverUrl}?min=${min}`);

    await page.focus('#component');
    await page.keyboard.press('ArrowLeft');
    await page.type('#component', '1');

    expect(await getValue()).toBe('30.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await page.type('#component', '2');
    expect(await getValue()).toBe('320.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('20.10');

    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('3.00');
  });

  it('Test max attribute', async () => {
    const max = 10;

    await page.goto(`${serverUrl}?max=${max}`);

    await page.focus('#component');
    await page.type('#component', '123');

    expect(await getValue()).toBe('1.23');

    await page.type('#component', '4');

    expect(await getValue()).toBe('10.00');
  });

  it('Test allow-blank attribute', async () => {
    await page.goto(`${serverUrl}?allowBlank=true`);

    expect(await getValue()).toBe('');

    await page.focus('#component');
    await page.type('#component', '5');

    expect(await getValue()).toBe('0.05');

    await page.keyboard.press('Backspace');

    expect(await getValue()).toBe('');

    await page.type('#component', '6');

    expect(await getValue()).toBe('0.06');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('');
  });

  it('Test minimum-number-of-characters attribute', async () => {
    await page.goto(`${serverUrl}?minimumNumberOfCharacters=8`);

    await page.focus('#component');
    await page.type('#component', '123456');

    expect(await getValue()).toBe('001,234.56');
  });

  it('Change event is emitted', async () => {
    const events = [];

    await page.exposeFunction('onCustomEvent', (event, value) => {
      events.push(value);
    });

    await page.goto(`${serverUrl}`);

    await page.$eval('#component', (input) => {
      input.addEventListener('change', (event, detail) => {
        console.log('event', event);
        console.log('detail', detail);
        window.onCustomEvent(event, event.target.value);
      });
    });

    await page.focus('#component');
    await page.type('#component', '123');

    expect(events.length).toBe(3);

    expect(events[0]).toBe('0.01');
    expect(events[1]).toBe('0.12');
    expect(events[2]).toBe('1.23');
  });

  it('Test if US format works correctly', async () => {
    await page.goto(`${serverUrl}?prefix=U$`);

    await page.focus('#component');
    await page.type('#component', '123456789');

    expect(await getValue()).toBe('U$1,234,567.89');
  });

  it('Test if I can positive and negative with the plus and minus signals', async () => {
    await page.goto(`${serverUrl}`);

    await page.focus('#component');
    await page.type('#component', '123456789');

    await page.keyboard.press('-');

    expect(await getValue()).toBe('-1,234,567.89');

    await page.keyboard.press('+');

    expect(await getValue()).toBe('1,234,567.89');
  });
});
