import { ExtractPropTypes } from 'vue';
import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';
import {
  addThousandSeparator,
  debug,
  fixed,
  isValidFloat,
  isValidInteger, joinIntegerAndDecimal,
  numbersToCurrency,
  onlyNumbers,
  round,
} from './Utils';

export default function format(
  input: string | number | null | undefined,
  opt: VMoneyOptions | ExtractPropTypes<never> = defaults,
  caller = '',
): string {
  debug(opt, 'utils format() - caller', caller);
  debug(opt, 'utils format() - input1', input);

  // Clamp precision once so every downstream call site (toFixed,
  // numbersToCurrency, BigNumber.toFixed) sees the same value. Without this,
  // numbersToCurrency() received a raw negative opt.precision and produced
  // 'N.' which BigNumber rejects as an invalid format.
  const precision = fixed(opt.precision);

  // preserve blank input as blank when allowBlank is enabled, even if treatZeroAsBlank is false
  if ((input === null || input === undefined || input === '') && opt.allowBlank) {
    return '';
  }

  if (input === null || input === undefined) {
    input = '';
  } else if (typeof input === 'number') {
    if (opt.shouldRound) {
      input = input.toFixed(precision);
    } else {
      // Number.toFixed maxes out at 100; clamp the +1 truncation step too.
      input = input.toFixed(Math.min(precision + 1, 100)).slice(0, -1);
    }
  } else if (opt.modelModifiers && opt.modelModifiers.number && isValidInteger(input)) {
    input = Number(input).toFixed(precision);
  } else if (!opt.disableNegative && input === '-') {
    return input;
  }

  debug(opt, 'utils format() - input2', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');

  let filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');

  debug(opt, 'utils format() - filtered', filtered);

  if (!precision && opt.thousands !== '.' && isValidFloat(filtered)) {
    filtered = round(filtered, 0);
    debug(opt, 'utils format() - !precision && isValidFloat()', filtered);
  }

  const numbers = onlyNumbers(filtered);

  debug(opt, 'utils format() - numbers', numbers);

  debug(opt, 'utils format() - numbersToCurrency', negative + numbersToCurrency(numbers, precision));

  const bigNumber = new BigNumber(negative + numbersToCurrency(numbers, precision));

  debug(opt, 'utils format() - bigNumber1', bigNumber.toString());

  // min and max must be a valid float or integer
  if (opt.max !== null && opt.max !== undefined && opt.max !== '') {
    if (bigNumber.biggerThan(opt.max)) {
      bigNumber.setNumber(opt.max);
    }
  }
  if (opt.min !== null && opt.min !== undefined && opt.min !== '') {
    if (bigNumber.lessThan(opt.min)) {
      bigNumber.setNumber(opt.min);
    }
  }

  // disableNegative strips the sign at parse time but a negative min/max can
  // pull the BigNumber back below zero via setNumber(opt.min|max). Re-clamp
  // here so the contract — "no negative output" — holds end-to-end.
  if (opt.disableNegative && bigNumber.lessThan(0)) {
    bigNumber.setNumber(0);
  }

  const currency = bigNumber.toFixed(precision, opt.shouldRound);

  debug(opt, 'utils format() - bigNumber2', bigNumber.toFixed(precision));

  // test if it is zero 0, or 0.0 or 0.00 and so on...
  if ((/^0(\.0+)?$/g).test(currency) && opt.allowBlank && opt.treatZeroAsBlank) {
    return '';
  }

  // eslint-disable-next-line prefer-const
  let [integer, decimal] = currency.split('.');

  const decimalLength = decimal !== undefined ? decimal.length : 0;

  const isNegative = integer.charAt(0) === '-';
  const digits = isNegative ? integer.slice(1) : integer;
  const padded = digits.padStart(opt.minimumNumberOfCharacters - decimalLength, '0');
  integer = (isNegative ? '-' : '') + addThousandSeparator(padded, opt.thousands);

  const output = opt.prefix
        + joinIntegerAndDecimal(integer, decimal, opt.decimal)
        + opt.suffix;

  debug(opt, 'utils format() - output', output);

  return output;
}
