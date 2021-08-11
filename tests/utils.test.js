import {
  RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS,
  validateRestrictedInput, validateRestrictedOptions,
  format, unformat,
} from '../src/utils';
import defaults from '../src/options';

test('test if a restricted value throws an error', () => {
  const caller = 'unit tester';
  for (const char of RESTRICTED_CHARACTERS) {
    try {
      validateRestrictedInput(char, caller);
    } catch (e) {
      const itIncludes = e.message.toString().includes(`v-money3 "${caller}" property don't accept "${char}" as a value.`);
      expect(itIncludes).toBe(true);
    }
  }
});

test('test if a non restricted value pass validation', () => {
  const caller = 'unit tester';
  const UNRESTRICTED_CHARACTERS = ['.', ',', '#', '/', '$'];
  for (const char of UNRESTRICTED_CHARACTERS) {
    try {
      const isValid = validateRestrictedInput(char, caller);
      expect(isValid).toBe(true);
    } catch (e) {
      const itIncludes = e.message.toString().includes(`v-money3 "${caller}" property don't accept "${char}" as a value.`);
      expect(itIncludes).toBe(false);
    }
  }
});

test('test if restricted values throw errors in restricted options', () => {
  const opt = { ...defaults };
  for (const char of RESTRICTED_CHARACTERS) {
    for (const option of RESTRICTED_OPTIONS) {
      opt[option] = char;
      try {
        validateRestrictedOptions({ ...opt[option] });
      } catch (e) {
        const text = `v-money3 "${option}" property don't accept "${char}" as a value.`;
        const itIncludes = e.message.toString().includes(text);
        expect(itIncludes).toBe(true);
      }
    }
  }
});

test('test if non restricted values pass validation in restricted options', () => {
  const UNRESTRICTED_CHARACTERS = ['.', ',', '#', '/', '$'];
  const opt = { ...defaults };
  for (const char of UNRESTRICTED_CHARACTERS) {
    for (const option of RESTRICTED_OPTIONS) {
      opt[option] = char;
      try {
        const isValid = validateRestrictedOptions({ ...opt[option] });
        expect(isValid).toBe(true);
      } catch (e) {
        const itIncludes = e.message.toString().includes(`v-money3 "${option}" property don't accept "${char}" as a value.`);
        expect(itIncludes).toBe(false);
      }
    }
  }
});

test('format function should parse numbers and strings', () => {
  expect(format('$123.001')).toBe('1,230.01');

  expect(format('')).toBe('0.00');
  expect(format(null)).toBe('0.00');
  expect(format(undefined)).toBe('0.00');
  expect(format(123.45)).toBe('123.45');

  expect(format(123.45, { ...defaults, prefix: 'R$ ' })).toBe('R$ 123.45');
  expect(format(123.45, { ...defaults, suffix: '/100' })).toBe('123.45/100');

  expect(format(1123.45, { ...defaults, thousands: '.', decimal: ',' })).toBe('1.123,45');

  expect(format(-1, { ...defaults, disableNegative: true })).toBe('1.00');
  expect(format('-123.45', { ...defaults, disableNegative: true })).toBe('123.45');

  expect(format(9, { ...defaults, min: 10 })).toBe('10.00');
  expect(format(11, { ...defaults, min: 10 })).toBe('11.00');
  expect(format(9.99, { ...defaults, min: 10 })).toBe('10.00');

  expect(format(9, { ...defaults, max: 10 })).toBe('9.00');
  expect(format(11, { ...defaults, max: 10 })).toBe('10.00');
  expect(format(10.01, { ...defaults, max: 10 })).toBe('10.00');

  expect(format(123.45, { ...defaults, minimumNumberOfCharacters: 7 })).toBe('00,123.45');

  expect(format('', { ...defaults, allowBlank: true })).toBe('');
  expect(format('5', { ...defaults, allowBlank: true })).toBe('5.00');

  expect(format('6', { ...defaults })).toBe('6.00');
});

test('unformat min max options should be respected', () => {
  expect(unformat('9.00', { ...defaults, min: 10 })).toBe('10.00');
  expect(unformat('11.00', { ...defaults, min: 10 })).toBe('11.00');
  expect(unformat('9.99', { ...defaults, min: 10 })).toBe('10.00');

  expect(unformat('9.00', { ...defaults, max: 10 })).toBe('9.00');
  expect(unformat('11.00', { ...defaults, max: 10 })).toBe('10.00');
  expect(unformat('10.01', { ...defaults, max: 10 })).toBe('10.00');
});

test('unformat number should strip the string', () => {
  expect(unformat('R$ 1.123,45/100', {
    ...defaults,
    prefix: 'R$ ',
    suffix: '/100',
    thousands: '.',
    decimal: ',',
  })).toBe('1123.45');
});

test('unformat should check for the number modifier', () => {
  expect(unformat('R$ 1.123,45/100', {
    ...defaults,
    prefix: 'R$ ',
    suffix: '/100',
    thousands: '.',
    decimal: ',',
    modelModifiers: {
      number: true,
    },
  })).toBe(1123.45);
});
