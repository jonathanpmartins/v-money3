import defaults from './options';

function isNormalInteger(str) {
  const n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

function isValidFloat(str) {
  return (/^-?[\d]*(\.[\d]+)?$/g).test(str);
}

function between(min, n, max) {
  return Math.max(min, Math.min(n, max));
}

// Uncaught RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
function fixed(precision) {
  return between(0, precision, 20);
}

function numbersToCurrency(numbers, precision) {
  const exp = 10 ** precision;
  const float = parseFloat(numbers) / exp;
  return float.toFixed(fixed(precision));
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

function format(input, opt = defaults, caller) {
  if (opt.debug) console.log('utils format() - caller', caller);
  if (opt.debug) console.log('utils format() - input1', input);

  if (input === null) {
    input = 0;
  }

  if (opt.allowBlank && isNormalInteger(input)) {
    input = numbersToCurrency(input, fixed(opt.precision));
  }

  if (typeof input === 'number') {
    input = Number(input).toFixed(fixed(opt.precision));
  } else if (!Number.isNaN(input)) {
    if (isNormalInteger(input)) {
      input = Number(input).toFixed(fixed(opt.precision));
    } else if (isValidFloat(input)) {
      if (caller === 'component setup' || caller === 'directive mounted') {
        input = Number(input).toFixed(fixed(opt.precision));
      }
    }
  }

  if (opt.debug) console.log('utils format() - input2', input);

  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? '-' : '') : '';
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  const numbers = onlyNumbers(filtered);

  let currency = Number(numbersToCurrency(numbers, opt.precision));
  if (opt.debug) console.log('utils format() - currency1', currency);
  if (currency > opt.max) {
    currency = opt.max;
  } else if (input < opt.min) {
    currency = opt.min;
  }
  if (opt.debug) console.log('utils format() - currency2', currency);

  currency = currency.toFixed(fixed(opt.precision));
  if (currency === '0.00' && opt.allowBlank) {
    return '';
  }

  const parts = toStr(currency).split('.');

  if (opt.minimumNumberOfCharacters > 0) {
    const currentLength = (`${parts[0]}`).length + (`${parts[1]}`).length;
    const diff = opt.minimumNumberOfCharacters - currentLength;
    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        parts[0] = `0${parts[0]}`;
      }
    }
  }

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

  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? -1 : 1) : 1;
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '');
  const numbers = onlyNumbers(filtered);
  let currency = numbersToCurrency(numbers, opt.precision);
  currency = parseFloat(currency) * negative;

  if (currency > opt.max) {
    currency = opt.max;
  } else if (input < opt.min) {
    currency = opt.min;
  }

  const output = Number(currency).toFixed(fixed(opt.precision));

  if (opt.debug) console.log('utils unformat() - output', output);

  return parseFloat(output);
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
  format,
  unformat,
  setCursor,
  event,
  fixed,
  numbersToCurrency,
};
