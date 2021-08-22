import defaults from './options';
import BigNumber from './BigNumber';
import Utils from './Utils';

function unformat(input, opt = defaults, caller) {
  if (opt.debug) console.log('utils unformat() - caller', caller);
  if (opt.debug) console.log('utils unformat() - input', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  if (opt.debug) console.log('utils unformat() - filtered', filtered);
  const numbers = Utils.onlyNumbers(filtered);
  if (opt.debug) console.log('utils unformat() - numbers', numbers);
  const bigNumber = new BigNumber(negative + Utils.numbersToCurrency(numbers, opt.precision));

  if (opt.debug) console.log('utils unformat() - bigNumber1', numbers.toString());

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

  let output = bigNumber.toFixed(Utils.fixed(opt.precision));

  if (opt.modelModifiers && opt.modelModifiers.number) {
    output = parseFloat(output);
  }

  if (opt.debug) console.log('utils unformat() - output', output);

  return output;
}

export default unformat;
