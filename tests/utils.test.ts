import {
  filterNumbersFromRestrictedOptions,
  filterOptRestrictions,
  filterRestrictedCharactersFromRestrictedOptions,
  guessFloatPrecision,
  isValidFloat,
  isValidInteger,
  removeLeadingZeros, replaceAt,
  RESTRICTED_CHARACTERS,
  RESTRICTED_OPTIONS, round,
  validateRestrictedInput,
  validateRestrictedOptions
} from '../src/Utils';
import defaults, { VMoneyOptions } from '../src/options';

beforeAll(() => {
  console.warn = () => {};
  console.log = () => {};
});

// todo: between
// todo: fixed
// todo: numbersToCurrency
// todo: toStr
// todo: onlyNumbers
// todo: addThousandSeparator
// todo: joinIntegerAndDecimal

test('test validateRestrictedInput(value, caller) method', () => {
  const caller = 'unit tester';
  for (const char of RESTRICTED_CHARACTERS) {
    const isValid = validateRestrictedInput(char, caller);
    expect(isValid).toBe(false);
  }

  const UNRESTRICTED_CHARACTERS = ['.', ',', '#', '/', '$'];
  for (const char of UNRESTRICTED_CHARACTERS) {
    const isValid = validateRestrictedInput(char, caller);
    expect(isValid).toBe(true);
  }

  for (const option of RESTRICTED_OPTIONS) {
    for (let i = 0; i < 10; i += 1) {
      const isValid = validateRestrictedInput(i, option);
      expect(isValid).toBe(false);
    }
  }
});

test('test validateRestrictedOptions(opt) method', () => {
  for (const target of RESTRICTED_OPTIONS) {
    for (const char of RESTRICTED_CHARACTERS) {
      const opt: VMoneyOptions = { ...defaults };
      opt[target] = char;
      const isValid = validateRestrictedOptions(opt);
      expect(isValid).toBe(false);
    }
  }

  const options = ['prefix', 'suffix'];
  for (const option of options) {
    for (let i = 0; i < 10; i += 1) {
      const opt = { ...defaults };
      opt[option] = i;
      const isValid = validateRestrictedOptions(opt);
      expect(isValid).toBe(false);
    }
  }
});

test('test filterRestrictedCharactersFromRestrictedOptions(opt) function', () => {
  const array = [
    { set: '+', target: '' },
    { set: '-', target: '' },
    { set: '+$0', target: '$0' },
    { set: '-$1', target: '$1' },
    { set: '+1+2+3+', target: '123' },
    { set: '-1-2-3-', target: '123' },
    { set: '++++++', target: '' },
    { set: '------', target: '' },
  ];

  for (const option of RESTRICTED_OPTIONS) {
    for (const item of array) {
      const opt = { ...defaults };
      opt[option] = item.set;

      const result = filterRestrictedCharactersFromRestrictedOptions(opt);

      expect(result[option]).toBe(item.target);
    }
  }
});

test('test filterNumbersFromRestrictedOptions(opt, option) function', () => {
  const array = [
    { set: 'R$1', target: 'R$' },
    { set: '$/3', target: '$/' },
    { set: 's0me1hing e1se', target: 'smehing ese' },
    { set: '+123', target: '+' },
    { set: '-1-2-3-4-5-6-7-8-9-0-', target: '-----------' },
  ];

  for (const option of RESTRICTED_OPTIONS) {
    for (const item of array) {
      const opt = { ...defaults };
      opt[option] = item.set;

      const result = filterNumbersFromRestrictedOptions(opt);

      expect(result[option]).toBe(item.target);
    }
  }
});

test('test filterOptRestrictions function', () => {
  const array = [
    { set: '+R$', target: 'R$' },
    { set: '-R1$', target: 'R$' },
    { set: '+100%', target: '%' },
    { set: '+$0', target: '$' },
    { set: '-$1', target: '$' },
    { set: '+9+8+7+6+5+', target: '' },
    { set: '-0-1-2-3-4-', target: '' },
    { set: '+9,', target: ',' },
    { set: '-.0', target: '.' },
  ];

  for (const option of RESTRICTED_OPTIONS) {
    for (const item of array) {
      const opt = { ...defaults };
      opt[option] = item.set;

      const result = filterOptRestrictions(opt);

      expect(result[option]).toBe(item.target);
    }
  }
});

test('test guessFloatPrecision function', () => {
  const tests = [
    { is: '1.1', target: 1 },
    { is: '1.11', target: 2 },
    { is: '1.111', target: 3 },
    { is: '-1.1', target: 1 },
    { is: '-1.11', target: 2 },
    { is: '-1.111', target: 3 },
    { is: '-1.111111111111111111111111111111', target: 30 },
  ];

  for (const item of tests) {
    expect(guessFloatPrecision(item.is)).toBe(item.target);
  }
});

test('test removeLeadingZeros function', () => {
  const tests = [
    { before: '01.11', after: '1.11' },
    { before: '-01.11', after: '-1.11' },
    { before: '001.23', after: '1.23' },
    { before: '-001.23', after: '-1.23' },
    { before: '0000012.34', after: '12.34' },
  ];

  for (const item of tests) {
    expect(removeLeadingZeros(item.before)).toBe(item.after);
  }
});

test('test isValidInteger function', () => {
  const valid = [
    '1',
    '123',
    '000123456',
    '-1',
    '-123',
    '-000123456',
  ];

  for (const item of valid) {
    expect(isValidInteger(item)).toBe(true);
  }

  const invalid = [
    '1.1',
    '-1.1',
  ];

  for (const item of invalid) {
    expect(isValidInteger(item)).toBe(false);
  }
});

test('test isValidFloat function', () => {
  const valid = [
    '1.1',
    '1.11',
    '11.11',
    '-11.11',
    '-1.11',
    '-1.1',
    '-001.11',
    '-01.11',
    '111111111.111111111',
    '99999999999999999999.99999999999999999999',
    '-111111111.111111111',
    '-00000000.000000000000',
  ];

  for (const item of valid) {
    expect(isValidFloat(item)).toBe(true);
  }

  const invalid = [
    '0',
    '1',
    '123',
    '2.',
    '.123',
    '-.123',
  ];

  for (const item of invalid) {
    expect(isValidFloat(item)).toBe(false);
  }
});

test('test replaceAt function', () => {
  const tests = [
    {
      is: 'ABC', index: 0, char: 'B', target: 'BBC',
    },
    {
      is: '123456', index: 1, char: '1', target: '113456',
    },
    {
      is: '999', index: 2, char: '8', target: '998',
    },
  ];

  for (const item of tests) {
    const replaced = replaceAt(item.is, item.index, item.char);

    expect(replaced).toBe(item.target);
  }
});

test('test round function', () => {
  const array = [
    { number: '1.23', precision: 0, target: '1' },
    { number: '1.23', precision: 1, target: '1.2' },
    { number: '1.23', precision: 2, target: '1.23' },
    { number: '1.23', precision: 3, target: '1.23' },

    { number: '9.9999', precision: 4, target: '9.9999' },
    { number: '9.9999', precision: 3, target: '10.000' },
    { number: '9.9999', precision: 2, target: '10.00' },
    { number: '9.9999', precision: 1, target: '10.0' },

    { number: '-8.76543', precision: 2, target: '-8.77' },
  ];
  for (const item of array) {
    const result = round(item.number, item.precision);
    expect(result).toBe(item.target);
  }
});
