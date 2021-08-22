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
  numbersToCurrency,
  onlyNumbers,
  addThousandSeparator,
  joinIntegerAndDecimal,
  validateRestrictedInput,
  validateRestrictedOptions,
  setCursor,
  event,
  fixed,
};
