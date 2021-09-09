import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';
import Utils from './Utils';

function format(input: string|number|null|undefined, opt: VMoneyOptions = defaults, caller?: any): string {
  Utils.debug(opt, 'utils format() - caller', caller);
  Utils.debug(opt, 'utils format() - input1', input);

  if (input === null || input === undefined) {
    input = '';
  } else if (typeof input === 'number') {
    input = input.toFixed(Utils.fixed(opt.precision));
  } else if (opt.modelModifiers && opt.modelModifiers.number) {
    if (Utils.isValidInteger(input)) {
      input = Number(input).toFixed(Utils.fixed(opt.precision));
    }
  }

  Utils.debug(opt, 'utils format() - input2', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');
  let filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  Utils.debug(opt, 'utils format() - filtered', filtered);
  if (!opt.precision && opt.thousands !== '.' && Utils.isValidFloat(filtered)) {
    filtered = Utils.round(filtered, 0);
    Utils.debug(opt, 'utils format() - !opt.precision && isValidFloat()', filtered);
  }
  const numbers = Utils.onlyNumbers(filtered);
  Utils.debug(opt, 'utils format() - numbers', numbers);

  Utils.debug(opt, 'utils format() - numbersToCurrency', negative + Utils.numbersToCurrency(numbers, opt.precision));
  const bigNumber = new BigNumber(negative + Utils.numbersToCurrency(numbers, opt.precision));
  Utils.debug(opt, 'utils format() - bigNumber1', bigNumber.toString());

  /// min and max must be a valid float or integer
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

  const currency = bigNumber.toFixed(Utils.fixed(opt.precision));

  Utils.debug(opt, 'utils format() - bigNumber2', bigNumber.toFixed(Utils.fixed(opt.precision)));

  // test if it is zero 0, or 0.0 or 0.00 and so on...
  if ((/^0(\.0+)?$/g).test(currency) && opt.allowBlank) {
    return '';
  }

  const parts = currency.split('.');

  const decimalLength = parts.length === 2 ? parts[1].length : 0;
  parts[0] = parts[0].padStart(opt.minimumNumberOfCharacters - decimalLength, '0');

  let integer = parts[0];
  const decimal = parts[1];
  integer = Utils.addThousandSeparator(integer, opt.thousands);

  const output = opt.prefix
        + Utils.joinIntegerAndDecimal(integer, decimal, opt.decimal)
        + opt.suffix;

  Utils.debug(opt, 'utils format() - output', output);

  return output;
}

export default format;
