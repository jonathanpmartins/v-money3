import Utils, {
  RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS,
} from '../src/Utils';
import defaults from '../src/options';

// test('test if a restricted value throws an error', () => {
//   const caller = 'unit tester';
//   for (const char of RESTRICTED_CHARACTERS) {
//     try {
//       Utils.validateRestrictedInput(char, caller);
//     } catch (e) {
//       const itIncludes = e.message.toString().includes(`v-money3 "${caller}" property don't accept "${char}" as a value.`);
//       expect(itIncludes).toBe(true);
//     }
//   }
// });
//
// test('test if a non restricted value pass validation', () => {
//   const caller = 'unit tester';
//   const UNRESTRICTED_CHARACTERS = ['.', ',', '#', '/', '$'];
//   for (const char of UNRESTRICTED_CHARACTERS) {
//     try {
//       const isValid = Utils.validateRestrictedInput(char, caller);
//       expect(isValid).toBe(true);
//     } catch (e) {
//       const itIncludes = e.message.toString().includes(`v-money3 "${caller}" property don't accept "${char}" as a value.`);
//       expect(itIncludes).toBe(false);
//     }
//   }
// });
//
// test('test if restricted values throw errors in restricted options', () => {
//   const opt = { ...defaults };
//   for (const char of RESTRICTED_CHARACTERS) {
//     for (const option of RESTRICTED_OPTIONS) {
//       opt[option] = char;
//       try {
//         Utils.validateRestrictedOptions({ ...opt[option] });
//       } catch (e) {
//         const text = `v-money3 "${option}" property don't accept "${char}" as a value.`;
//         const itIncludes = e.message.toString().includes(text);
//         expect(itIncludes).toBe(true);
//       }
//     }
//   }
// });
//
// test('test if non restricted values pass validation in restricted options', () => {
//   const UNRESTRICTED_CHARACTERS = ['.', ',', '#', '/', '$'];
//   const opt = { ...defaults };
//   for (const char of UNRESTRICTED_CHARACTERS) {
//     for (const option of RESTRICTED_OPTIONS) {
//       opt[option] = char;
//       try {
//         const isValid = Utils.validateRestrictedOptions({ ...opt[option] });
//         expect(isValid).toBe(true);
//       } catch (e) {
//         const itIncludes = e.message.toString().includes(`v-money3 "${option}" property don't accept "${char}" as a value.`);
//         expect(itIncludes).toBe(false);
//       }
//     }
//   }
// });
//
// test('test if numbers on prefix and suffix throw errors', () => {
//   const callers = ['prefix', 'suffix'];
//
//   for (const caller of callers) {
//     for (let i = 0; i < 10; i += 1) {
//       const char = `$${i}#`;
//       try {
//         Utils.validateRestrictedInput(char, caller);
//       } catch (e) {
//         const itIncludes = e.message.toString().includes(`v-money3 "${caller}" property don't accept any number "${char}" as a value.`);
//         expect(itIncludes).toBe(true);
//       }
//     }
//   }
// });

test('test filterRestrictedCharactersFromRestrictedOptions(opt) function', () => {
  const array = [
    { option: 'decimal', set: '+', target: '' },
    { option: 'decimal', set: '-', target: '' },
    { option: 'thousands', set: '+', target: '' },
    { option: 'thousands', set: '-', target: '' },
    { option: 'prefix', set: '+$', target: '$' },
    { option: 'prefix', set: '-$', target: '$' },
    { option: 'suffix', set: '+$', target: '$' },
    { option: 'suffix', set: '-$', target: '$' },
    { option: 'decimal', set: '+1+2+3+', target: '123' },
    { option: 'thousands', set: '-1-2-3-', target: '123' },
    { option: 'prefix', set: '++++++', target: '123' },
    { option: 'suffix', set: '------', target: '123' },
  ];
  for (const item of array) {
    const opt = defaults;
    opt[item.option] = item.set;

    const result = Utils.filterRestrictedCharactersFromRestrictedOptions(opt);

    expect(result[item.option]).toBe(item.target);
  }
});

test('test filterNumbersFromOption(opt, option) function', () => {
  const array = [
    { option: 'prefix', set: 'R$1', target: 'R$' },
    { option: 'prefix', set: '$/3', target: '$/' },
    { option: 'suffix', set: 's0me1hing e1se', target: 'smehing ese' },
    { option: 'suffix', set: '123', target: '' },
    { option: 'suffix', set: '-1-2-3-4-5-6-7-8-9-0-', target: '-----------' },
  ];
  for (const item of array) {
    const opt = defaults;
    opt[item.option] = item.set;

    const result = Utils.filterNumbersFromOption(opt, item.option);

    expect(result[item.option]).toBe(item.target);
  }
});

// todo: filterOptRestrictions

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
    expect(Utils.guessFloatPrecision(item.is)).toBe(item.target);
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
    expect(Utils.removeLeadingZeros(item.before)).toBe(item.after);
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
    expect(Utils.isValidInteger(item)).toBe(true);
  }

  const invalid = [
    '1.1',
    '-1.1',
  ];

  for (const item of invalid) {
    expect(Utils.isValidInteger(item)).toBe(false);
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
    expect(Utils.isValidFloat(item)).toBe(true);
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
    expect(Utils.isValidFloat(item)).toBe(false);
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
    const replaced = Utils.replaceAt(item.is, item.index, item.char);

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
    const result = Utils.round(item.number, item.precision);
    expect(result).toBe(item.target);
  }
});
