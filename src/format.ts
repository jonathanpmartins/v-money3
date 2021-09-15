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
  opt: VMoneyOptions = defaults,
  caller = '',
): string {
  debug(opt, 'utils format() - caller', caller);
  debug(opt, 'utils format() - input1', input);

  if (input === null || input === undefined) {
    input = '';
  } else if (typeof input === 'number') {
    if (opt.shouldRound) {
      input = input.toFixed(fixed(opt.precision));
    } else {
      input = input.toFixed(fixed(opt.precision) + 1).slice(0, -1);
    }
  } else if (opt.modelModifiers && opt.modelModifiers.number && isValidInteger(input)) {
    input = Number(input).toFixed(fixed(opt.precision));
  }

  debug(opt, 'utils format() - input2', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');

  let filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');

  debug(opt, 'utils format() - filtered', filtered);

  if (!opt.precision && opt.thousands !== '.' && isValidFloat(filtered)) {
    filtered = round(filtered, 0);
    debug(opt, 'utils format() - !opt.precision && isValidFloat()', filtered);
  }

  const numbers = onlyNumbers(filtered);

  debug(opt, 'utils format() - numbers', numbers);

  debug(opt, 'utils format() - numbersToCurrency', negative + numbersToCurrency(numbers, opt.precision));

  const bigNumber = new BigNumber(negative + numbersToCurrency(numbers, opt.precision));

  debug(opt, 'utils format() - bigNumber1', bigNumber.toString());

  // min and max must be a valid float or integer
  if (opt.max) {
    if (bigNumber.biggerThan(opt.max)) {
      bigNumber.setNumber(opt.max);
    }
  }
  if (opt.min) {
    if (bigNumber.lessThan(opt.min)) {
      bigNumber.setNumber(opt.min);
    }
  }

  const currency = bigNumber.toFixed(fixed(opt.precision), opt.shouldRound);

  debug(opt, 'utils format() - bigNumber2', bigNumber.toFixed(fixed(opt.precision)));

  // test if it is zero 0, or 0.0 or 0.00 and so on...
  if ((/^0(\.0+)?$/g).test(currency) && opt.allowBlank) {
    return '';
  }

  // eslint-disable-next-line prefer-const
  let [integer, decimal] = currency.split('.');

  const decimalLength = decimal !== undefined ? decimal.length : 0;

  integer = integer.padStart(opt.minimumNumberOfCharacters - decimalLength, '0');

  integer = addThousandSeparator(integer, opt.thousands);

  const output = opt.prefix
        + joinIntegerAndDecimal(integer, decimal, opt.decimal)
        + opt.suffix;

  debug(opt, 'utils format() - output', output);

  return output;
}
