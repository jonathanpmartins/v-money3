/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import {
  RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS,
} from '../../../src/Utils';
import Money3Component from '../../../src/component.vue';
import Money3Directive from '../../../src/directive';

beforeAll(() => {
  console.warn = () => {};
  console.log = () => {};
});

function mountComponent(attr: Record<string, unknown> = {}) {
  // modelValue is forced to null so tests can drive initial state via
  // setProps() after mount. Cast bypasses the prop's declared
  // [Number, String] type — intentional in tests, not a runtime issue.
  const props = {
    ...attr,
    modelValue: null,
  } as never;
  const global = {
    directives: {
      money3: Money3Directive,
    },
  };
  return mount(Money3Component, { props, global });
}

test('Renders the component', async () => {
  const component = mountComponent({
    prefix: 'R$ ',
    suffix: '.???',
    thousands: ',',
    decimal: '.',
    precision: 3,
  });

  const input = component.find('input');

  await input.setValue('1123.450');

  expect(input.element.value).toBe('R$ 1,123.450.???');
});

test('Test prefix attribute', async () => {
  const data = ['$', '€', 'R$ ', '₿', '\\', '@'];

  for (const prefix of data) {
    const input = mountComponent({ prefix }).find('input');

    await input.setValue('123.45');

    expect(input.element.value).toBe(`${prefix}123.45`);
  }
});

test('Test suffix attribute', async () => {
  const data = ['$', '€', 'R$ ', '₿', '($)'];

  for (const suffix of data) {
    const input = mountComponent({ suffix }).find('input');

    await input.setValue('123.45');

    expect(input.element.value).toBe(`123.45${suffix}`);
  }
});

test('Test thousands attribute', async () => {
  const data = ['.', '|', '#', ';'];

  for (const thousands of data) {
    const input1 = mountComponent({ thousands, modelModifiers: { number: true } }).find('input');

    await input1.setValue('9999999999999');

    expect(input1.element.value)
      .toBe(`9${thousands}999${thousands}999${thousands}999${thousands}999.00`);

    const input2 = mountComponent({ thousands }).find('input');

    await input2.setValue('9999999999999');

    expect(input2.element.value)
      .toBe(`99${thousands}999${thousands}999${thousands}999.99`);
  }
});

test('Test decimal attribute', async () => {
  const data = ['.', ',', '#', ';', '\''];

  for (const decimal of data) {
    const input = mountComponent({ decimal }).find('input');

    await input.setValue('123.45');

    expect(input.element.value).toBe(`123${decimal}45`);
  }
});

test('Test precision attribute', async () => {
  for (let precision = 2; precision < 10; precision += 1) {
    const input = mountComponent({ precision, thousands: '' }).find('input');

    const number = 1234567891234 / (!precision ? 1 : 10 ** precision);

    await input.setValue(`${number}`);

    const toBe = number.toFixed(precision);

    expect(input.element.value).toBe(toBe);
  }
});

test('Test default integer model', async () => {
  const input = mountComponent({
    modelValue: 1,
    'model-value': 1,
    precision: 2,
  }).find('input');

  expect(input.element.value).toBe('1.00');
});

test('Test disable-negative attribute', async () => {
  const input = mountComponent({ disableNegative: true }).find('input');

  await input.setValue('1.10');

  expect(input.element.value).toBe('1.10');

  await input.setValue('-1.10');

  expect(input.element.value).toBe('1.10');
});

test('Test disable attribute', async () => {
  const disabled = true;

  const input = mountComponent({ disabled }).find('input');

  expect(input.element.disabled).toBe(disabled);
});

test('Test min attribute', async () => {
  for (const min of [10, -10, -100]) {
    const input = mountComponent({ min }).find('input');

    await input.setValue((min - 1.01).toFixed(2));
    expect(input.element.value).toBe(min.toFixed(2));

    await input.setValue((min - 1).toFixed(2));
    expect(input.element.value).toBe(min.toFixed(2));
  }
});

test('Test max attribute', async () => {
  for (const max of [10, -10, -100]) {
    const input = mountComponent({ max }).find('input');

    await input.setValue((max + 1.01).toFixed(2));
    expect(input.element.value).toBe(max.toFixed(2));

    await input.setValue((max + 1).toFixed(2));
    expect(input.element.value).toBe(max.toFixed(2));
  }
});

test('Test allow-blank attribute', async () => {
  const allowBlank = true;

  const input = mountComponent({ allowBlank }).find('input');

  await input.setValue('');

  expect(input.element.value).toBe('');
});

test('Test allow-blank with treat-zero-as-blank=true (default) coalesces zero to blank', async () => {
  const input = mountComponent({ allowBlank: true }).find('input');

  await input.setValue('0');

  expect(input.element.value).toBe('');
});

test('Test allow-blank with treat-zero-as-blank=false preserves zero', async () => {
  const input = mountComponent({ allowBlank: true, treatZeroAsBlank: false }).find('input');

  await input.setValue('0');

  expect(input.element.value).toBe('0.00');
});

test('Test allow-blank with treat-zero-as-blank=false still allows clearing the input', async () => {
  const input = mountComponent({ allowBlank: true, treatZeroAsBlank: false }).find('input');

  await input.setValue('');

  expect(input.element.value).toBe('');
});

test('Backspace on zero does not clear input when treat-zero-as-blank=false', async () => {
  const input = mountComponent({ allowBlank: true, treatZeroAsBlank: false }).find('input');

  await input.setValue('0');
  expect(input.element.value).toBe('0.00');

  input.element.setSelectionRange(input.element.value.length, input.element.value.length);
  await input.trigger('keydown', { code: 'Backspace' });

  expect(input.element.value).toBe('0.00');
});

test('Backspace on zero clears input when treat-zero-as-blank=true (default)', async () => {
  const input = mountComponent({ allowBlank: true }).find('input');

  await input.setValue('0.01');
  await input.setValue('0');

  input.element.setSelectionRange(input.element.value.length, input.element.value.length);
  await input.trigger('keydown', { code: 'Backspace' });

  expect(input.element.value).toBe('');
});

test('Change event is emitted', async () => {
  const component = mountComponent();
  const input = component.find('input');

  await input.setValue('123.45');

  expect(component.emitted()).toHaveProperty('change');

  const incrementEvent = component.emitted<Event[]>('change');
  incrementEvent!.forEach((item) => {
    expect((item[0].target as HTMLInputElement).value).toBe('123.45');
  });
});

test('Test minimum-number-of-characters attribute', async () => {
  const input = mountComponent({ minimumNumberOfCharacters: 8 }).find('input');

  await input.setValue('123.45');

  expect(input.element.value).toBe('000,123.45');
});

test('Test if US format works correctly', async () => {
  const input = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 2,
    masked: true,
  }).find('input');

  await input.setValue('1513.15');

  expect(input.element.value).toBe('1,513.15');
});

test('Test if restricted characters are correctly validated!', async () => {
  for (const character of RESTRICTED_CHARACTERS) {
    for (const option of RESTRICTED_OPTIONS) {
      try {
        const attr: Record<string, string> = {};
        attr[option] = character;
        mountComponent(attr);
      } catch (e) {
        const message = `v-money3 "${option}" property don't accept "${character}" as a value`;

        const hasException = (e as Error).message.includes(message);

        expect(hasException).toBe(true);
      }
    }
  }
});

/* ----------------- not tested in e2e puppeteer ----------------- */

test('Test if null v-model is turned into zero', async () => {
  const input = mountComponent({ precision: 0 }).find('input');

  await input.setValue(null);

  expect(input.element.value).toBe('0');
});

test('Test oninput pre-format integers', async () => {
  const input = mountComponent({
    modelValue: 2,
    'model-value': 2,
    precision: 2,
  }).find('input');

  expect(input.element.value).toBe('2.00');

  await input.setValue(1);

  expect(input.element.value).toBe('0.01');
});

test('Test if non masked values are correctly translated', async () => {
  const component = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 2,
    masked: false,
  });
  const input = component.find('input');

  await input.setValue('5971513.15');

  const updates = component.emitted<string[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe('5971513.15');
  expect(input.element.value).toBe('5,971,513.15');
});

test('Test if the v-model number modifier work correctly', async () => {
  const component = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 3,
    masked: false,
    modelModifiers: {
      number: true,
    },
  });
  const input = component.find('input');

  await input.setValue('971513.158');

  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe(971513.158);
  expect(input.element.value).toBe('971,513.158');
});

test('Guarantee that the v-model number modifier always returns a float number even if masked property is true', async () => {
  const component = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 2,
    masked: true,
    modelModifiers: {
      number: true,
    },
  });
  const input = component.find('input');

  await input.setValue('8971513.15');

  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe(8971513.15);
  expect(input.element.value).toBe('8,971,513.15');
});

test('Test if watcher correctly propagates changes made on v-model', async () => {
  const component = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 2,
    masked: false,
  });

  await component.setProps({ modelValue: 5 });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(component.vm.formattedValue).toBe('5.00');

  await component.setProps({ modelValue: 5.1 });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(component.vm.formattedValue).toBe('5.10');

  await component.setProps({ modelValue: '5.13' });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(component.vm.formattedValue).toBe('5.13');
});

test('Test default user expectations', async () => {
  const strings = [
    { set: '9', toBe: '0.09' },
    { set: '99', toBe: '0.99' },
    { set: '999', toBe: '9.99' },
    { set: '9999', toBe: '99.99' },

    { set: '9.90', toBe: '9.90' },
    { set: '9.99', toBe: '9.99' },
  ];

  for (const item of strings) {
    const component = mountComponent();

    const input = component.find('input');

    await component.setProps({ modelValue: item.set });

    expect(input.element.value).toBe(item.toBe);
  }

  const numbers = [
    { set: 9, toBe: '9.00' },
    { set: 99, toBe: '99.00' },
    { set: 999, toBe: '999.00' },
    { set: 9999, toBe: '9,999.00' },
    { set: 9.9, toBe: '9.90' },
    { set: 9.99, toBe: '9.99' },
    { set: 9.999, toBe: '10.00' },
  ];

  for (const item of numbers) {
    const component = mountComponent({ modelModifiers: { number: true } });

    const input = component.find('input');

    await component.setProps({ modelValue: item.set });

    expect(input.element.value).toBe(item.toBe);
  }
});

test('Test arbitrary precision', async () => {
  const component = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 2,
    masked: false,
    // max: 1e30,
  });
  const input = component.find('input');

  await input.setValue('999999999999999999999.99');

  const updates = component.emitted<string[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe('999999999999999999999.99');
  expect(input.element.value).toBe('999,999,999,999,999,999,999.99');
});

test('Test arbitrary precision with decimal rounded', async () => {
  const component1 = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 0,
    masked: false,
    max: '1000000000000000000000',
  });
  const input1 = component1.find('input');

  await input1.setValue('999999999999999999999.99');

  const updates1 = component1.emitted<string[]>()['update:model-value'];
  expect(updates1[updates1.length - 1][0]).toBe('1000000000000000000000');
  expect(input1.element.value).toBe('1,000,000,000,000,000,000,000');

  const component2 = mountComponent({
    decimal: '.',
    thousands: ',',
    precision: 0,
    masked: false,
    max: '2000000000000000000000',
  });
  const input2 = component2.find('input');

  await input2.setValue('1999999999999999999999.99');

  const updates2 = component2.emitted<string[]>()['update:model-value'];
  expect(updates2[updates2.length - 1][0]).toBe('2000000000000000000000');
  expect(input2.element.value).toBe('2,000,000,000,000,000,000,000');

  await input2.setValue('999999999999999999999.99');
});

test('Weird separators', async () => {
  const component = mountComponent({
    decimal: 'd',
    thousands: 't',
    precision: 2,
    masked: true,
  });
  const input = component.find('input');

  await input.setValue('1234567d89');

  const updates = component.emitted<string[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe('1t234t567d89');
  expect(input.element.value).toBe('1t234t567d89');
});

test('Decimal values rounded when precision is 0', async () => {
  const component = mountComponent({
    decimal: 'd',
    thousands: 't',
    precision: 0,
    masked: true,
  });
  const input = component.find('input');

  await input.setValue('1234567.89');

  const updates = component.emitted<string[]>()['update:model-value'];
  expect(updates[updates.length - 1][0]).toBe('1t234t568');
  expect(input.element.value).toBe('1t234t568');
});

test('Number type value', async () => {
  const component = mountComponent({
    decimal: 'd',
    thousands: 't',
    precision: 2,
    masked: true,
    modelValue: 12.1,
    'model-value': 12.1,
  });
  const input = component.find('input');
  expect(input.element.value).toBe('12d10');
});

test('Event count', async () => {
  const component = mountComponent({
    decimal: 'd',
    thousands: 't',
    precision: 2,
  });
  const input = component.find('input');

  await input.setValue('1234');
  await input.setValue('1234567.89');

  const updates = component.emitted()['update:model-value'];
  expect(updates.length).toBe(2); // Starting 0.00 plus 1 changes
});

// Regression (#88 / v3.26.0): identity-format configs — where the formatted
// string is byte-identical to the raw input (precision 0, no
// prefix/suffix/thousands/decimal) — stopped emitting update:model-value while
// typing because setValue() early-returns when `formatted === el.value`,
// skipping the synthetic `change`. The model only synced on blur. v3.24.1
// emitted on every input. See issue: model stale while focused.
test('Identity-format config emits update:model-value on input', async () => {
  const component = mountComponent({
    precision: 0,
    prefix: '',
    suffix: '',
    thousands: '',
    decimal: '',
  });
  const input = component.find('input');

  // Simulate real typing: only the native `input` event fires while the field
  // is focused — the `change` event is dispatched by the browser on blur.
  // (VTU's setValue() also fires `change`, which would mask this bug.)
  // formatted('25') === '25', so setValue()'s `formatted === el.value` guard
  // early-returns and never dispatches the synthetic `change` → no emit.
  input.element.value = '25';
  await input.trigger('input');

  const updates = component.emitted<string[]>()['update:model-value'];
  expect(updates).toBeTruthy(); // must have emitted while typing, not only on blur
  expect(updates[updates.length - 1][0]).toBe('25');
  expect(input.element.value).toBe('25');
});

test('Leading zeroes', async () => {
  const component = mountComponent({
    decimal: 'd',
    thousands: 't',
    precision: 4,
  });
  const input = component.find('input');

  await input.setValue('0.00001234');

  const updates = component.emitted()['update:model-value'];
  expect(updates.length).toBe(1); // Make sure it doesn't take multiple rounds of formatting
  expect(input.element.value).toBe('0d1234');
});

test('Test if first digit is correctly recognized with v-model.number modifier component', async () => {
  const component = mountComponent({ modelModifiers: { number: true } });
  const input = component.find('input');

  await input.setValue('1');

  expect(input.element.value).toBe('0.01');
});

test('Test shouldRound property works correctly', async () => {
  const component = mountComponent({ modelModifiers: { number: true } });
  const input = component.find('input');

  await component.setProps({ modelValue: 12345.678 });

  expect(input.element.value).toBe('12,345.68');

  await component.setProps({ shouldRound: false });

  await component.setProps({ modelValue: 123456.789 });

  expect(input.element.value).toBe('123,456.78');
});

test('Test start with negative symbol', async () => {
  const component = mountComponent({ modelModifiers: { number: true } });
  const input = component.find('input');

  await component.setProps({ modelValue: '-' });

  expect(input.element.value).toBe('-');
});

test('#99 — precision increase 2 to 3 preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: true },
  });
  const input = component.find('input');
  await component.setProps({ modelValue: 2.22 });
  // initial render
  expect(input.element.value).toBe('2,22');

  await component.setProps({ precision: 3 });

  expect(input.element.value).toBe('2,220');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeUndefined();
});

test('#99 — precision increase 2 to 4 preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.22 });
  expect(component.find('input').element.value).toBe('2,22');

  await component.setProps({ precision: 4 });

  expect(component.find('input').element.value).toBe('2,2200');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeUndefined();
});

test('#99 — precision decrease 3 to 2 with shouldRound=true rounds half-up', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 3,
    shouldRound: true,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.225 });
  expect(component.find('input').element.value).toBe('2,225');

  await component.setProps({ precision: 2 });

  expect(component.find('input').element.value).toBe('2,23');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeDefined();
  expect(Number(updates[updates.length - 1][0])).toBeCloseTo(2.23, 10);
});

test('#99 — precision decrease 3 to 2 with shouldRound=false truncates', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 3,
    shouldRound: false,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.225 });
  expect(component.find('input').element.value).toBe('2,225');

  await component.setProps({ precision: 2 });

  expect(component.find('input').element.value).toBe('2,22');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeDefined();
  expect(Number(updates[updates.length - 1][0])).toBeCloseTo(2.22, 10);
});

test('#99 — shouldRound toggle reformats display', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    shouldRound: true,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.225 });
  expect(component.find('input').element.value).toBe('2,23');

  await component.setProps({ shouldRound: false });

  expect(component.find('input').element.value).toBe('2,22');
});

test('#99 — re-setting precision to same value emits no update', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.22 });
  const initialEmits = (component.emitted<number[]>()['update:model-value'] || []).length;

  await component.setProps({ precision: 2 });

  const finalEmits = (component.emitted<number[]>()['update:model-value'] || []).length;
  expect(finalEmits).toBe(initialEmits);
});

test('#99 — decimal change preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 2.22 });
  expect(component.find('input').element.value).toBe('2,22');
  const initialEmits = (component.emitted<number[]>()['update:model-value'] || []).length;

  await component.setProps({ decimal: '.', thousands: ',' });

  expect(component.find('input').element.value).toBe('2.22');
  const finalEmits = (component.emitted<number[]>()['update:model-value'] || []).length;
  expect(finalEmits).toBe(initialEmits);
});

test('#99 — thousands change preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 1234.56 });
  expect(component.find('input').element.value).toBe('1.234,56');
  const initialEmits = (component.emitted<number[]>()['update:model-value'] || []).length;

  await component.setProps({ thousands: ' ' });

  expect(component.find('input').element.value).toBe('1 234,56');
  const finalEmits = (component.emitted<number[]>()['update:model-value'] || []).length;
  expect(finalEmits).toBe(initialEmits);
});

test('#99 — prefix change preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    prefix: '',
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 10 });
  expect(component.find('input').element.value).toBe('10,00');
  const initialEmits = (component.emitted<number[]>()['update:model-value'] || []).length;

  await component.setProps({ prefix: 'R$ ' });

  expect(component.find('input').element.value).toBe('R$ 10,00');
  const finalEmits = (component.emitted<number[]>()['update:model-value'] || []).length;
  expect(finalEmits).toBe(initialEmits);
});

test('#99 — suffix change preserves numeric model value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    suffix: '',
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 10 });
  expect(component.find('input').element.value).toBe('10,00');
  const initialEmits = (component.emitted<number[]>()['update:model-value'] || []).length;

  await component.setProps({ suffix: ' USD' });

  expect(component.find('input').element.value).toBe('10,00 USD');
  const finalEmits = (component.emitted<number[]>()['update:model-value'] || []).length;
  expect(finalEmits).toBe(initialEmits);
});

test('#99 — max clamp on prop change emits clamped value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    max: `${Number.MAX_SAFE_INTEGER}`,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 100 });
  expect(component.find('input').element.value).toBe('100,00');

  await component.setProps({ max: 10 });

  expect(component.find('input').element.value).toBe('10,00');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeDefined();
  expect(Number(updates[updates.length - 1][0])).toBe(10);
});

test('#99 — min clamp on prop change emits clamped value', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    min: `${Number.MIN_SAFE_INTEGER}`,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 0 });
  expect(component.find('input').element.value).toBe('0,00');

  await component.setProps({ min: 5 });

  expect(component.find('input').element.value).toBe('5,00');
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeDefined();
  expect(Number(updates[updates.length - 1][0])).toBe(5);
});

test('#99 — allowBlank toggle reformats empty modelValue', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    allowBlank: false,
    modelModifiers: { number: false },
  });
  await component.setProps({ modelValue: '' });
  // With allowBlank false, format('') → "0,00"
  expect(component.find('input').element.value).toBe('0,00');

  await component.setProps({ allowBlank: true });

  expect(component.find('input').element.value).toBe('');
});

test('#99 — treatZeroAsBlank toggle clears display when value is zero', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    allowBlank: true,
    treatZeroAsBlank: false,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 0 });
  expect(component.find('input').element.value).toBe('0,00');

  await component.setProps({ treatZeroAsBlank: true });

  expect(component.find('input').element.value).toBe('');
});

test('#99 — minimumNumberOfCharacters change pads display', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    minimumNumberOfCharacters: 0,
    modelModifiers: { number: true },
  });
  await component.setProps({ modelValue: 1 });
  expect(component.find('input').element.value).toBe('1,00');

  await component.setProps({ minimumNumberOfCharacters: 5 });

  // 1,00 → integer part needs to reach (5 - 2) = 3 chars → "001"
  expect(component.find('input').element.value).toBe('001,00');
});

test('#99 — modelModifiers.number toggle reformats and switches emit type', async () => {
  const component = mountComponent({
    decimal: ',',
    thousands: '.',
    precision: 2,
    modelModifiers: { number: false },
  });
  await component.setProps({ modelValue: '2.22' });
  expect(component.find('input').element.value).toBe('2,22');

  await component.setProps({ modelModifiers: { number: true } });

  expect(component.find('input').element.value).toBe('2,22');
  // No assertion on emitted type — just that no corruption occurred.
});

test('disableNegative + .number modifier with "-" modelValue must not silently desync', async () => {
  // bug: setup() at component.vue:165 evaluates `disableNegative || value !== '-'`,
  // which is true when disableNegative=true AND value='-'. It then runs
  // `Number('-').toFixed(2)` -> 'NaN' (string). format('NaN') defensively yields
  // '0.00', so the displayed value is sanitized — but no update:model-value is
  // emitted, leaving the parent's modelValue stuck at '-' while the view shows
  // '0.00'. v-model contract broken: source-of-truth diverges from display.
  const component = mount(Money3Component, {
    props: {
      modelValue: '-',
      disableNegative: true,
      modelModifiers: { number: true },
    } as never,
    global: { directives: { money3: Money3Directive } },
  });

  await component.vm.$nextTick();

  const display = component.find('input').element.value;
  expect(display).toBe('0.00');

  // Display was sanitized; parent must be told so it can reconcile.
  const updates = component.emitted<number[]>()['update:model-value'];
  expect(updates).toBeDefined();
  expect(updates![updates!.length - 1][0]).toBe(0);
});

test('masked mode reconciles parent on format-affecting opts change', async () => {
  // bug: in masked mode (masked=true, no .number modifier), change() emits the
  // formatted display string (e.g. "1,234.56"), so the parent's modelValue is
  // also that string. When a format-affecting prop changes, reformatOnOptsChange
  // recomputes formattedValue and updates the display — but the NaN guard at
  // (Number("1,234.56") === NaN) early-returns before emit, so the parent is
  // never told. Display says "123.456", modelValue stays "1,234.56".
  const component = mount(Money3Component, {
    props: {
      modelValue: '0',
      masked: true,
      precision: 2,
      thousands: ',',
      decimal: '.',
    } as never,
    global: { directives: { money3: Money3Directive } },
  });
  const input = component.find('input');

  // Drive a real change so masked emits the formatted string and parent syncs.
  await input.setValue('1234.56');
  const updates0 = component.emitted<unknown[]>()['update:model-value']!;
  const afterChange = updates0[updates0.length - 1][0];
  expect(afterChange).toBe('1,234.56');
  await component.setProps({ modelValue: afterChange as never });
  const emitCountBefore = updates0.length;

  // Change a format-affecting prop. Display reinterprets digits under the new
  // precision; parent must be reconciled, not silently desynced.
  await component.setProps({ precision: 3 });
  await component.vm.$nextTick();

  expect(input.element.value).toBe('123.456');

  const updates1 = component.emitted<unknown[]>()['update:model-value']!;
  expect(updates1.length).toBeGreaterThan(emitCountBefore);
  // Newest emit must match the actually-displayed value so parent stays in sync.
  expect(updates1[updates1.length - 1][0]).toBe('123.456');
});

test('component setup path tolerates precision > 100 (no RangeError)', async () => {
  // component.vue used Number(modelValue).toFixed(fixed(precision)+1) in the
  // .number + shouldRound:false initial-value path. fixed() capped at 1000,
  // so any precision > 99 threw RangeError from Number.toFixed.
  expect(() => mountComponent({
    modelValue: 1.5,
    precision: 200,
    modelModifiers: { number: true },
    shouldRound: false,
  })).not.toThrow();

  expect(() => mountComponent({
    modelValue: 1.5,
    precision: 200,
    modelModifiers: { number: true },
    shouldRound: true,
  })).not.toThrow();
});

test('#96 — setMaxIfBigger=false keeps last valid display when typing past max', async () => {
  // Issue scenario: max=100, precision=0. User types "99" (valid), then a
  // third digit '3' making it 993. Default behavior auto-clamps to 100. With
  // setMaxIfBigger=false the input should retain the previous valid value
  // ("99") rather than snap to the ceiling.
  const component = mountComponent({
    max: 100,
    precision: 0,
    setMaxIfBigger: false,
  });
  const input = component.find('input');

  await input.setValue('99');
  expect(input.element.value).toBe('99');

  await input.setValue('993');

  expect(input.element.value).toBe('99');
});

test('#96 — setMaxIfBigger default (true) still clamps to max', async () => {
  // Regression guard: omitting the flag preserves the historical clamp.
  const component = mountComponent({
    max: 100,
    precision: 0,
  });
  const input = component.find('input');

  await input.setValue('99');
  expect(input.element.value).toBe('99');

  await input.setValue('993');

  expect(input.element.value).toBe('100');
});
