import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';
import Utils from './Utils';

function unformat(input: string, opt: VMoneyOptions = defaults, caller?: any): string|number {
  Utils.debug(opt, 'utils unformat() - caller', caller);
  Utils.debug(opt, 'utils unformat() - input', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  Utils.debug(opt, 'utils unformat() - filtered', filtered);
  const numbers = Utils.onlyNumbers(filtered);
  Utils.debug(opt, 'utils unformat() - numbers', numbers);
  const bigNumber = new BigNumber(negative + Utils.numbersToCurrency(numbers, opt.precision));

  Utils.debug(opt, 'utils unformat() - bigNumber1', numbers.toString());

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

  let output = bigNumber.toFixed(Utils.fixed(opt.precision), opt.shouldRound);

  if (opt.modelModifiers && opt.modelModifiers.number) {
    // @ts-ignore
    output = parseFloat(output);
  }

  Utils.debug(opt, 'utils unformat() - output', output);

  return output;
}

export default unformat;
