import format from '../src/format';
import defaults from '../src/options';

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

  expect(format('5', { ...defaults })).toBe('0.05');
  expect(format('5.5', { ...defaults })).toBe('0.55');
  expect(format('5.55', { ...defaults })).toBe('5.55');

  expect(format(5, { ...defaults, modelModifiers: { number: true } })).toBe('5.00');
  expect(format(5.5, { ...defaults, modelModifiers: { number: true } })).toBe('5.50');
  expect(format(5.55, { ...defaults, modelModifiers: { number: true } })).toBe('5.55');

  expect(format(6.6789678967896789, {
    ...defaults,
    modelModifiers: { number: true },
    shouldRound: false,
  })).toBe('6.67');

  expect(format(6.6789678967896789, {
    ...defaults,
    modelModifiers: { number: true },
    shouldRound: true,
  })).toBe('6.68');

  // code coverage on debug console.log instructions
  expect(format('12345.67', { ...defaults, debug: true })).toBe('12,345.67');
});
