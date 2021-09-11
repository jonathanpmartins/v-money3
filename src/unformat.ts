import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';
import { Debug, fixed, numbersToCurrency, onlyNumbers } from './Utils';

function unformat(input: string, opt: VMoneyOptions = defaults, caller?: any): string|number {
  Debug(opt, 'utils unformat() - caller', caller);
  Debug(opt, 'utils unformat() - input', input);

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  Debug(opt, 'utils unformat() - filtered', filtered);
  const numbers = onlyNumbers(filtered);
  Debug(opt, 'utils unformat() - numbers', numbers);
  const bigNumber = new BigNumber(negative + numbersToCurrency(numbers, opt.precision));

  Debug(opt, 'utils unformat() - bigNumber1', numbers.toString());

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

  let output = bigNumber.toFixed(fixed(opt.precision), opt.shouldRound);

  if (opt.modelModifiers && opt.modelModifiers.number) {
    // @ts-ignore
    output = parseFloat(output);
  }

  Debug(opt, 'utils unformat() - output', output);

  return output;
}

export default unformat;
