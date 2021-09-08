import defaults from './options';
import BigNumber from './BigNumber';
import Utils from './Utils';

function format(input, opt = defaults, caller) {
  if (opt.debug) console.log('utils format() - caller', caller);
  if (opt.debug) console.log('utils format() - input1', input);

  if (input === null || input === undefined) {
    input = '';
  } else if (typeof input === 'number') {
    if (opt.shouldRound) {
      input = input.toFixed(Utils.fixed(opt.precision));
    } else {
      input = input.toFixed(Utils.fixed(opt.precision) + 1).slice(0, -1);
    }
  } else if (opt.modelModifiers && opt.modelModifiers.number) {
    if (Utils.isValidInteger(input)) {
      input = Number(input).toFixed(Utils.fixed(opt.precision));
    }
  }

  // console.log('opt', opt);

  if (opt.debug) console.log('utils format() - input2', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');
  let filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  if (opt.debug) console.log('utils format() - filtered', filtered);
  if (!opt.precision && opt.thousands !== '.' && BigNumber.isValidFloat(filtered)) {
    filtered = BigNumber.round(filtered, 0);
    if (opt.debug) console.log('utils format() - !opt.precision && isValidFloat()', filtered);
  }
  const numbers = Utils.onlyNumbers(filtered);
  if (opt.debug) console.log('utils format() - numbers', numbers);

  if (opt.debug) console.log('utils format() - numbersToCurrency', negative + Utils.numbersToCurrency(numbers, opt.precision));
  const bigNumber = new BigNumber(negative + Utils.numbersToCurrency(numbers, opt.precision));
  if (opt.debug) console.log('utils format() - bigNumber1', bigNumber.toString());

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

  const currency = bigNumber.toFixed(Utils.fixed(opt.precision), opt.shouldRound);

  if (opt.debug) console.log('utils format() - bigNumber2', bigNumber.toFixed(Utils.fixed(opt.precision)));

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

  if (opt.debug) console.log('utils format() - output', output);

  return output;
}

export default format;
