/**
 * @jest-environment puppeteer
 */

/* eslint-disable no-underscore-dangle */
// The dev harness (tests/component/App.vue) exposes its reactive configs as
// `window.__configs` for these e2e tests. The leading underscores are a
// deliberate "don't touch from app code" marker — disabled file-wide here.

describe('Puppeteer Component Tests', () => {
  const target = '#component-0';
  const serverUrl = 'http://127.0.0.1:12345';
  const serverUrlWithTarget = `${serverUrl}?target=${target.substring(1)}`;

  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  async function getValue(t = target) {
    return page.$eval(t, (input: Element) => (input as HTMLInputElement).value);
  }

  type HarnessWindow = Window & { __configs?: Array<Record<string, unknown>> };

  async function waitForConfigs() {
    await page.waitForFunction(() => {
      const cfgs = (window as HarnessWindow).__configs;
      return Array.isArray(cfgs) && cfgs.length > 0;
    });
  }

  async function patchConfig(patch: Record<string, unknown>) {
    await page.evaluate((p) => {
      const cfgs = (window as HarnessWindow).__configs;
      if (cfgs && cfgs[0]) Object.assign(cfgs[0], p);
    }, patch);
  }

  async function waitForInputValue(value: string, sel = target) {
    await page.waitForFunction(
      (s, v) => (document.querySelector(s) as HTMLInputElement | null)?.value === v,
      {},
      sel,
      value,
    );
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
    const isDisabled = await page.$eval(target, (input: Element) => (input as HTMLInputElement).disabled);

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

  it(`#96 — setMaxIfBigger=false stops keystrokes that exceed max ${target}`, async () => {
    // Issue scenario from #96: max=100, precision=0. Typing "99" is valid;
    // the next digit would push the value past max. Default clamps to 100;
    // with setMaxIfBigger=false the display should retain "99" instead.
    await page.goto(`${serverUrlWithTarget}&max=100&precision=0&setMaxIfBigger=false`);

    await page.focus(target);
    await page.type(target, '99');
    expect(await getValue()).toBe('99');

    await page.type(target, '3');
    expect(await getValue()).toBe('99');

    // Regression: default (omit flag) still clamps.
    await page.goto(`${serverUrlWithTarget}&max=100&precision=0`);

    await page.focus(target);
    await page.type(target, '993');
    expect(await getValue()).toBe('100');
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
    const events: string[] = [];

    await page.exposeFunction('onCustomEvent', (_event: Event, value: string) => {
      events.push(value);
    });

    await page.goto(`${serverUrlWithTarget}`);

    await page.$eval(target, (input: Element) => {
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

    expect(events.length).toBe(3);

    expect(events[0]).toBe('0.01');
    expect(events[1]).toBe('0.12');
    expect(events[2]).toBe('1.23');
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

  // Regression (#88 / v3.26.0): for identity-format configs — where the
  // formatted string equals the raw typed value (precision 0, no
  // prefix/suffix/thousands/decimal) — v-model went stale while the field was
  // focused and only synced on blur. Real keystrokes fire only `input` (the
  // browser fires `change` on blur), so this path can't be reproduced with
  // VTU's setValue() helper, which also fires `change`. Here we type, then read
  // the live v-model (the harness renders `model: [<modelValue>]`) WITHOUT
  // blurring first.
  it(`Identity-format config keeps v-model live while typing ${target}`, async () => {
    await page.goto(
      `${serverUrlWithTarget}&precision=0&prefix=empty&suffix=empty&thousands=empty&decimal=empty&modelValue=31`,
    );

    expect(await getValue()).toBe('31');

    await page.focus(target);
    // select-all so the typed value replaces the initial '31'
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.type(target, '25');

    // still focused — no blur. Live v-model must already reflect '25'.
    const stillFocused = await page.$eval(
      target,
      (input: Element) => document.activeElement === input,
    );
    expect(stillFocused).toBe(true);

    const modelText = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('li div'));
      const d = divs.find((el) => (el.textContent || '').trim().startsWith('model:'));
      return d ? (d.textContent || '').trim() : null;
    });

    expect(await getValue()).toBe('25');
    expect(modelText).toBe('model: [25]'); // buggy: stays 'model: [31]' until blur
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

  it('Test focusOnRight property works correctly with puppeteer', async () => {
    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowLeft');
    await page.type(target, '123456');
    expect(await getValue()).toBe('1,234,560.00');

    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await page.type(target, '123456');
    expect(await getValue()).toBe('1,234.56');

    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true&focusOnRight=true`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowLeft');
    await page.type(target, '123456');
    expect(await getValue()).toBe('12,345.60');

    await page.goto(`${serverUrlWithTarget}&useModelNumberModifier=true&focusOnRight=true`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await page.type(target, '123456');
    expect(await getValue()).toBe('1,234.56');
  });

  const precision222Url = `${serverUrlWithTarget}`
    + '&precision=2&modelValue=2.22&useModelNumberModifier=true&decimal=%2C&thousands=.';

  const precision3225Url = `${serverUrlWithTarget}`
    + '&precision=3&modelValue=2.225&useModelNumberModifier=true&shouldRound=true'
    + '&decimal=%2C&thousands=.';

  async function getModelText() {
    return page.$eval(`${target} ~ div`, (el) => el.textContent || '');
  }

  it(`#99 — precision change at runtime preserves model value ${target}`, async () => {
    await page.goto(precision222Url);
    await waitForConfigs();
    expect(await getValue()).toBe('2,22');

    await patchConfig({ precision: 3 });
    await waitForInputValue('2,220');

    expect(await getValue()).toBe('2,220');
    expect(await getModelText()).toMatch(/2\.22/);
  });

  it(`#99 — precision round-trip preserves model value ${target}`, async () => {
    await page.goto(precision222Url);
    await waitForConfigs();

    await patchConfig({ precision: 4 });
    await waitForInputValue('2,2200');
    expect(await getValue()).toBe('2,2200');

    await patchConfig({ precision: 2 });
    await waitForInputValue('2,22');
    expect(await getValue()).toBe('2,22');
  });

  it(`#99 — precision decrease with shouldRound emits rounded model ${target}`, async () => {
    await page.goto(precision3225Url);
    await waitForConfigs();
    expect(await getValue()).toBe('2,225');

    await patchConfig({ precision: 2 });
    await waitForInputValue('2,23');

    expect(await getModelText()).toMatch(/2\.23/);
  });
});
