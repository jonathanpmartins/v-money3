/**
 * @jest-environment puppeteer
 */

describe('Puppeteer Component Tests', () => {
  const target = '#component-0';
  const serverUrl = 'http://127.0.0.1:12345';
  const serverUrlWithTarget = `${serverUrl}?target=${target.substring(1)}`;

  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  async function getValue(t = target) {
    return page.$eval<string>(t, (input: Element) => (input as HTMLInputElement).value);
  }

  it(`Test prefix attribute ${target}`, async () => {
    const data = ['R$ ', '$', '€', '₿', '\\', '@'];

    for (const prefix of data) {
      await page.goto(`${serverUrlWithTarget}&prefix=${prefix.replaceAll(' ', '+')}`);

      await page.focus(target);
      await page.type(target, '12345');

      expect(await getValue()).toBe(`${prefix}123.45`);
    }
  });

  it(`Test suffix attribute ${target}`, async () => {
    const data = ['#', '%', '$', '€', '₿', '($)'];

    for (const suffix of data) {
      const treated = suffix
        .replaceAll('%', '%25')
        .replaceAll('#', '%23');

      await page.goto(`${serverUrlWithTarget}&suffix=${treated}`);

      await page.focus(target);
      await page.type(target, '123456');

      expect(await getValue()).toBe(`1,234.56${suffix}`);
    }
  });

  it(`Test thousands attribute ${target}`, async () => {
    const data = [',', '.', '|', '#', ';'];

    for (const thousands of data) {
      const treated = thousands.replaceAll('#', '%23');

      await page.goto(`${serverUrlWithTarget}&thousands=${treated}`);

      await page.focus(target);
      await page.type(target, '9999999999999');

      expect(await getValue()).toBe(`99${thousands}999${thousands}999${thousands}999.99`);
    }
  });

  it(`Test decimal attribute ${target}`, async () => {
    const data = [',', '.', '#', ';', '\'', '/'];

    for (const decimal of data) {
      const treated = decimal
        .replaceAll('#', '%23')
        .replaceAll(',', '%2C');

      await page.goto(`${serverUrlWithTarget}&decimal=${treated}`);

      await page.focus(target);
      await page.type(target, '12345.67');

      expect(await getValue()).toBe(`12,345${decimal}67`);
    }
  });

  it(`Test precision attribute ${target}`, async () => {
    const number = 1234567891234;

    for (let precision = 0; precision < 10; precision += 1) {
      await page.goto(`${serverUrlWithTarget}&thousands=empty&precision=${precision}`);

      await page.focus(target);
      await page.type(target, `${number}`);

      const value = await getValue();

      const toBe = (number / (10 ** precision)).toFixed(precision);

      expect(value).toBe(`${toBe}`);
    }
  });

  it(`Test default integer model ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&modelValue=12`);

    expect(await getValue()).toBe('0.12');

    await page.goto(`${serverUrlWithTarget}&modelValue=12.00`);

    expect(await getValue()).toBe('12.00');

    await page.goto(`${serverUrlWithTarget}&modelValue=12&useModelNumberModifier=true`);

    expect(await getValue()).toBe('12.00');

    await page.goto(`${serverUrlWithTarget}&modelValue=12.1&useModelNumberModifier=true`);

    expect(await getValue()).toBe('12.10');
  });

  it(`Test default float model ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&modelValue=12.1`);

    expect(await getValue()).toBe('1.21');

    await page.goto(`${serverUrlWithTarget}&modelValue=12.1&useModelNumberModifier=true`);

    expect(await getValue()).toBe('12.10');
  });

  it(`Test if "v-model.number" modifier is working when typed ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&modelValue=15&useModelNumberModifier=true`);

    expect(await getValue()).toBe('15.00');

    await page.focus(target);
    await page.type(target, '3');

    expect(await getValue()).toBe('150.03');

    await page.goto(`${serverUrlWithTarget}&modelValue=15.1&useModelNumberModifier=true`);

    expect(await getValue()).toBe('15.10');

    await page.focus(target);
    await page.type(target, '4');

    expect(await getValue()).toBe('151.04');

    await page.keyboard.press('Backspace');

    expect(await getValue()).toBe('15.10');
  });

  it(`Test disable-negative attribute ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}`);

    await page.focus(target);
    await page.type(target, '62185');

    expect(await getValue()).toBe('621.85');

    await page.type(target, '-');

    expect(await getValue()).toBe('-621.85');

    // ---------

    await page.goto(`${serverUrlWithTarget}&disableNegative=true`);

    await page.focus(target);
    await page.type(target, '35684');

    expect(await getValue()).toBe('356.84');

    await page.type(target, '-');

    expect(await getValue()).toBe('356.84');
  });

  it(`Test disable attribute ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&disabled=true`);

    // eslint-disable-next-line max-len
    const isDisabled = await page.$eval<boolean>(target, (input: Element) => (input as HTMLInputElement).disabled);

    expect(isDisabled).toBe(true);
  });

  it(`Test min attribute ${target}`, async () => {
    const min = 3;

    await page.goto(`${serverUrlWithTarget}&min=${min}`);

    await page.focus(target);
    await page.keyboard.press('ArrowLeft');
    await page.type(target, '1');

    expect(await getValue()).toBe('30.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await page.type(target, '2');
    expect(await getValue()).toBe('320.10');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('20.10');

    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('3.00');
  });

  it(`Test max attribute ${target}`, async () => {
    const max = 10;

    await page.goto(`${serverUrlWithTarget}&max=${max}`);

    await page.focus(target);
    await page.type(target, '123');

    expect(await getValue()).toBe('1.23');

    await page.type(target, '4');

    expect(await getValue()).toBe('10.00');
  });

  it(`Test allow-blank attribute ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&allowBlank=true`);

    expect(await getValue()).toBe('');

    await page.focus(target);
    await page.type(target, '5');

    expect(await getValue()).toBe('0.05');

    await page.keyboard.press('Backspace');

    expect(await getValue()).toBe('');

    await page.type(target, '6');

    expect(await getValue()).toBe('0.06');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');

    expect(await getValue()).toBe('');
  });

  it(`Test if allow-blank works on all precisions ${target}`, async () => {
    const number = '123456';
    const maxPrecision = 6;

    for (let i = 0; i < maxPrecision; i += 1) {
      await page.goto(`${serverUrlWithTarget}&allowBlank=true&thousands=empty&precision=${i}`);

      expect(await getValue()).toBe('');

      await page.focus(target);
      await page.type(target, number);

      const value = await getValue();

      // TODO added parseFloat
      const toBe = (parseFloat(number) / (10 ** i)).toFixed(i);

      expect(value).toBe(`${toBe}`);

      for (let l = 0; l < number.length; l += 1) {
        await page.keyboard.press('Backspace', { delay: 50 });
      }

      expect(await getValue()).toBe('');
    }
  });

  it(`Test minimum-number-of-characters attribute ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&minimumNumberOfCharacters=8`);

    await page.focus(target);
    await page.type(target, '123456');

    expect(await getValue()).toBe('001,234.56');
  });

  it(`Change event is emitted ${target}`, async () => {
    const events: any[] = [];

    await page.exposeFunction('onCustomEvent', (event: any, value: any) => {
      events.push(value);
    });

    await page.goto(`${serverUrlWithTarget}`);

    await page.$eval<void>(target, (input: Element) => {
      input.addEventListener('change', (event: Event) => {
        const { value } = event.target as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.onCustomEvent(event, value);
      });
    });

    await page.focus(target);
    await page.type(target, '123');

    // removing lastKnownValue from directive setValue method
    // does trigger change events 2 times every time the user type.
    // First time on the oninput event, and after on the updated event.

    expect(events.length).toBe(6);

    expect(events[0]).toBe('0.01');
    expect(events[1]).toBe('0.01');
    expect(events[2]).toBe('0.12');
    expect(events[3]).toBe('0.12');
    expect(events[4]).toBe('1.23');
    expect(events[5]).toBe('1.23');
  });

  it(`Test if US format works correctly ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&prefix=U$`);

    await page.focus(target);
    await page.type(target, '123456789');

    expect(await getValue()).toBe('U$1,234,567.89');
  });

  it(`Test if I can positive and negative with the plus and minus signals ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}`);

    await page.focus(target);
    await page.type(target, '123456789');

    await page.keyboard.press('-');

    expect(await getValue()).toBe('-1,234,567.89');

    await page.keyboard.press('+');

    expect(await getValue()).toBe('1,234,567.89');
  });

  it(`Test if precision "0" (zero) with thousand "." (dot) work correctly ${target}`, async () => {
    await page.goto(`${serverUrlWithTarget}&precision=0&thousands=.&debug=true`);

    await page.focus(target);
    await page.type(target, '123456789');

    expect(await getValue()).toBe('123.456.789');
  });

  it('Test if first digit is correctly recognized with v-model.number modifier with puppeteer', async () => {
    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true`);

    await page.keyboard.press('Tab');
    await page.type(target, '123');

    expect(await getValue()).toBe('1.23');
  });

  it('Test shouldRound property works correctly with puppeteer', async () => {
    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true&modelValue=12345.678`);

    expect(await getValue()).toBe('12,345.68');

    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true&modelValue=123456.789&shouldRound=false`);

    expect(await getValue()).toBe('123,456.78');
  });

  it('Test start with negative symbol with puppeteer', async () => {
    await page.goto(`${serverUrlWithTarget}&modelValue=-`);

    expect(await getValue()).toBe('-');

    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true&modelValue=-`);

    expect(await getValue()).toBe('-');
  });

  it('Tests that the Options of the directive cannot share information inside a loop of components', async () => {
    const options = [
      {
        modelValue: 0, prefix: '', suffix: '#', thousands: ',', decimal: '.', precision: 2,
      },
      {
        modelValue: 0, prefix: '', suffix: '%', thousands: ',', decimal: '.', precision: 2,
      },
      {
        modelValue: 0, prefix: '', suffix: 'º', thousands: ',', decimal: '.', precision: 2,
      },
    ];

    const payload = encodeURIComponent(JSON.stringify(options));

    await page.goto(`${serverUrlWithTarget}&payload=${payload}`);

    for (let i = 0; i < options.length; i += 1) {
      await page.waitForSelector(`#component-${i}`);

      await page.click(`#component-${i}`);
      await page.keyboard.press('Backspace');

      expect(await getValue(`#component-${i}`)).toBe(`0.00${options[i].suffix}`);
    }
  });
});
