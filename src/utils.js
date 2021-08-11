import defaults from './options';

const RESTRICTED_CHARACTERS = ['+', '-'];
const RESTRICTED_OPTIONS = ['decimal', 'thousands', 'prefix', 'suffix'];

function between(min, n, max) {
  return Math.max(min, Math.min(n, max));
}

// Uncaught RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
function fixed(precision) {
  return between(0, precision, 20);
}

function numbersToCurrency(numbers, precision) {
  numbers = numbers.padStart(precision + 1, '0');
  return precision === 0 ? numbers : `${numbers.slice(0, -precision)}.${numbers.slice(-precision)}`;
}

function toStr(value) {
  return value ? value.toString() : '';
}

function onlyNumbers(input) {
  return toStr(input).replace(/\D+/g, '') || '0';
}

function addThousandSeparator(integer, separator) {
  return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
}

function joinIntegerAndDecimal(integer, decimal, separator) {
  return decimal ? integer + separator + decimal : integer;
}

function validateRestrictedInput(value, caller) {
  if (RESTRICTED_CHARACTERS.includes(value)) {
    throw new Error(`v-money3 "${caller}" property don't accept "${value}" as a value.`);
  }
  return true;
}

function validateRestrictedOptions(opt) {
  for (const target of RESTRICTED_OPTIONS) {
    validateRestrictedInput(opt[target], target);
  }
  return true;
}

function format(input, opt = defaults, caller) {
  if (opt.debug) console.log('utils format() - caller', caller);
  if (opt.debug) console.log('utils format() - input1', input);

  if (input === null || typeof input === 'undefined') {
    input = '';
  } else if (typeof input === 'number') {
    input = input.toFixed(fixed(opt.precision));
  } else if (opt.precision > 0 && !input.includes('.') && !input.includes(opt.decimal)) {
    // Integer string, append 0 decimal
    input += `.${'0'.repeat(opt.precision)}`;
  } else if (opt.precision === 0 && input.includes('.')) {
    // Someone entered a decimal when it's not allowed, round
    // it instead of treating the decimal as part of the number
    const decimalIndex = input.indexOf('.');
    // Rounding is a bit difficult with strings, might be worth redoing this with BigInt
    let currentIndex = decimalIndex - 1;
    let rounded = '';
    if (['5', '6', '7', '8', '9'].indexOf(input[decimalIndex + 1]) !== false) {
      for (; input[currentIndex] === '9' && currentIndex >= 0; currentIndex -= 1) {
        rounded = `0${rounded}`;
      }
      if (currentIndex === -1) {
        rounded = `1${rounded}`;
        currentIndex = 0;
      } else {
        rounded = (parseInt(input[currentIndex], 10) + 1) + rounded;
      }
    }
    rounded = input.slice(0, currentIndex) + rounded;
    input = rounded;
  }
  if (input === '' && opt.allowBlank) {
    return '';
  }

  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? '-' : '') : '';
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  let numbers = onlyNumbers(filtered);

  // Trim leading zeroes
  let trimIndex = 0;
  for (; numbers[trimIndex] === '0'; trimIndex += 1);
  numbers = numbers.slice(trimIndex);
  // Pad zeroes
  const padded = numbers.padStart(opt.minimumNumberOfCharacters, '0');

  input = numbersToCurrency(padded, opt.precision);
  if (opt.debug) console.log('utils format() - input2', input);

  let currency = parseFloat(negative + input);
  if (opt.debug) console.log('utils format() - currency1', currency);
  if (currency > opt.max) {
    currency = opt.max;
    input = Math.abs(currency).toFixed(fixed(opt.precision));
  } else if (currency < opt.min) {
    currency = opt.min;
    input = Math.abs(currency).toFixed(fixed(opt.precision));
  }
  if (opt.debug) console.log('utils format() - currency2', currency);

  currency = currency.toFixed(fixed(opt.precision));
  if (currency === '0.00' && opt.allowBlank) {
    return '';
  }

  const parts = input.split('.');

  const decimalLength = parts.length === 2 ? parts[1].length : 0;
  parts[0].padStart(opt.minimumNumberOfCharacters - decimalLength, '0');

  let integer = parts[0];
  const decimal = parts[1];
  integer = addThousandSeparator(integer, opt.thousands);

  const output = opt.prefix
      + negative
      + joinIntegerAndDecimal(integer, decimal, opt.decimal)
      + opt.suffix;

  if (opt.debug) console.log('utils format() - output', output);

  return output;
}

function unformat(input, opt = defaults, caller) {
  if (opt.debug) console.log('utils unformat() - caller', caller);
  if (opt.debug) console.log('utils unformat() - input', input);

  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? '-' : '') : '';
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  const numbers = onlyNumbers(filtered);
  input = numbersToCurrency(numbers, opt.precision);
  let currency = parseFloat(negative + input);

  if (currency > opt.max) {
    currency = opt.max;
    input = Math.abs(currency).toFixed(fixed(opt.precision));
  } else if (input < opt.min) {
    currency = opt.min;
    input = Math.abs(currency).toFixed(fixed(opt.precision));
  }

  let output = negative + input;

  if (opt.modelModifiers && opt.modelModifiers.number) {
    output = parseFloat(output);
  }

  if (opt.debug) console.log('utils unformat() - output', output);

  return output;
}

function setCursor(el, position) {
  const setSelectionRange = () => {
    el.setSelectionRange(position, position);
  };
  if (el === document.activeElement) {
    setSelectionRange();
    setTimeout(setSelectionRange, 1); // Android Fix
  }
}

// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
function event(name) {
  const evt = document.createEvent('Event');
  evt.initEvent(name, true, true);
  return evt;
}

export {
  RESTRICTED_CHARACTERS,
  RESTRICTED_OPTIONS,
  format,
  unformat,
  setCursor,
  event,
  fixed,
  numbersToCurrency,
  validateRestrictedInput,
  validateRestrictedOptions,
};
