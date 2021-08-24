import unformat from '../src/unformat';
import defaults from '../src/options';

beforeAll(() => {
  console.warn = () => {};
  console.log = () => {};
});

test('unformat min max options should be respected', () => {
  expect(unformat('9.00', { ...defaults, min: 10 })).toBe('10.00');
  expect(unformat('11.00', { ...defaults, min: 10 })).toBe('11.00');
  expect(unformat('9.99', { ...defaults, min: 10 })).toBe('10.00');

  expect(unformat('9.00', { ...defaults, max: 10 })).toBe('9.00');
  expect(unformat('11.00', { ...defaults, max: 10 })).toBe('10.00');
  expect(unformat('10.01', { ...defaults, max: 10 })).toBe('10.00');

  // code coverage on debug console.log instructions
  expect(unformat('12,345.67', { ...defaults, debug: true }, 'unit test')).toBe('12345.67');
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
