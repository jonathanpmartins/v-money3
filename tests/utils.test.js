import {
  RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS,
  validateRestrictedInput, validateRestrictedOptions,
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
