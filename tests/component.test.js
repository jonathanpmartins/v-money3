import { mount } from '@vue/test-utils';
import { RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS } from '../src/utils';
import Money3Component from '../src/component.vue';
import Money3Directive from '../src/directive';

function mountComponent(attr = {}) {
  const props = {
    ...attr,
    modelValue: null,
  };
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
    suffix: '.000',
    thousands: ',',
    decimal: '.',
    precision: 3,
  });

  const input = component.find('input');

  await input.setValue('1123.450');

  expect(input.element.value).toBe('R$ 1,123.450.000');
});

test('Test prefix attribute', async () => {
  const data = ['$', '€', 'R$ ', '₿', '1\\', '2\\'];

  for (const prefix of data) {
    const input = mountComponent({ prefix }).find('input');

    await input.setValue('123.45');

    expect(input.element.value).toBe(`${prefix}123.45`);
  }
});

test('Test suffix attribute', async () => {
  const data = ['$', '€', 'R$ ', '₿', '.00', '($)', '/3'];

  for (const suffix of data) {
    const input = mountComponent({ suffix }).find('input');

    await input.setValue('123.45');

    expect(input.element.value).toBe(`123.45${suffix}`);
  }
});

test('Test thousands attribute', async () => {
  const data = ['.', '|', '#', ';'];

  for (const thousands of data) {
    const input = mountComponent({ thousands, modelModifiers: { number: true } }).find('input');

    await input.setValue('9999999999999');

    expect(input.element.value)
      .toBe(`9${thousands}999${thousands}999${thousands}999${thousands}999.00`);

    // .toBe(`99${thousands}999${thousands}999${thousands}999.99`);
    // the line above make the test pass, but it is wrong... should be and integer?!
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

    const toBe = parseFloat(number).toFixed(precision);

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
  const min = '10';

  const input = mountComponent({ min }).find('input');

  await input.setValue('11.00');

  expect(input.element.value).toBe('11.00');

  await input.setValue('9.00');

  expect(input.element.value).toBe('10.00');

  await input.setValue('9.99');

  expect(input.element.value).toBe('10.00');
});

test('Test max attribute', async () => {
  const max = '10';

  const input = mountComponent({ max }).find('input');

  await input.setValue('9.01');

  expect(input.element.value).toBe('9.01');

  await input.setValue('9.99');

  expect(input.element.value).toBe('9.99');

  await input.setValue('11.10');

  expect(input.element.value).toBe('10.00');

  await input.setValue('10.01');

  expect(input.element.value).toBe('10.00');
});

test('Test allow-blank attribute', async () => {
  const allowBlank = true;

  const input = mountComponent({ allowBlank }).find('input');

  await input.setValue('');

  expect(input.element.value).toBe('');
});

test('Change event is emitted', async () => {
  const component = mountComponent();
  const input = component.find('input');

  await input.setValue(123.45);

  expect(component.emitted()).toHaveProperty('change');

  const incrementEvent = component.emitted('change');
  incrementEvent.forEach((item) => {
    expect(item[0].target.value).toBe('123.45');
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
        const attr = {};
        attr[option] = character;
        mountComponent(attr);
      } catch (e) {
        const message = `v-money3 "${option}" property don't accept "${character}" as a value`;

        const hasException = e.message.includes(message);

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

  const updates = component.emitted()['update:model-value'];
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

  const updates = component.emitted()['update:model-value'];
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

  const updates = component.emitted()['update:model-value'];
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

  expect(component.vm.data.formattedValue).toBe('5.00');

  await component.setProps({ modelValue: 5.1 });

  expect(component.vm.data.formattedValue).toBe('5.10');

  await component.setProps({ modelValue: '5.13' });

  expect(component.vm.data.formattedValue).toBe('5.13');
});
