import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';
import {
  debug, fixed, numbersToCurrency, onlyNumbers,
} from './Utils';

export default function unformat(
  input: string,
  opt: VMoneyOptions = defaults,
  caller = '',
): string | number {
  debug(opt, 'utils unformat() - caller', caller);
  debug(opt, 'utils unformat() - input', input);

  if (!opt.disableNegative && input === '-') {
    debug(opt, 'utils unformat() - return netagive symbol', input);
    return input;
  }

  const negative = opt.disableNegative ? '' : (input.indexOf('-') >= 0 ? '-' : '');

  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');

  debug(opt, 'utils unformat() - filtered', filtered);

  const numbers = onlyNumbers(filtered);

  debug(opt, 'utils unformat() - numbers', numbers);

  const bigNumber = new BigNumber(negative + numbersToCurrency(numbers, opt.precision));

  debug(opt, 'utils unformat() - bigNumber1', numbers.toString());

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

  let output: string | number = bigNumber.toFixed(fixed(opt.precision), opt.shouldRound);

  if (opt.modelModifiers && opt.modelModifiers.number) {
    output = parseFloat(output);
  }

  debug(opt, 'utils unformat() - output', output);

  return output;
}
