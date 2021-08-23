const RESTRICTED_CHARACTERS = ['+', '-'];
const RESTRICTED_OPTIONS = ['decimal', 'thousands', 'prefix', 'suffix'];

class Utils {
  static between(min, n, max) {
    return Math.max(min, Math.min(n, max));
  }

  // Uncaught RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
  static fixed(precision) {
    return Utils.between(0, precision, 20);
  }

  static numbersToCurrency(numbers, precision) {
    numbers = numbers.padStart(precision + 1, '0');
    return precision === 0 ? numbers : `${numbers.slice(0, -precision)}.${numbers.slice(-precision)}`;
  }

  static toStr(value) {
    return value ? value.toString() : '';
  }

  static onlyNumbers(input) {
    return Utils.toStr(input).replace(/\D+/g, '') || '0';
  }

  static addThousandSeparator(integer, separator) {
    return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
  }

  static joinIntegerAndDecimal(integer, decimal, separator) {
    return decimal ? integer + separator + decimal : integer;
  }

  static validateRestrictedInput(value, caller) {
    if (RESTRICTED_CHARACTERS.includes(value)) {
      console.error(`v-money3 "${caller}" property don't accept "${value}" as a value.`);
      return false;
      // throw new Error(`v-money3 "${caller}" property don't accept "${value}" as a value.`);
    }
    if (caller === 'prefix' || caller === 'suffix') {
      if ((/\d/g).test(value)) {
        console.error(`v-money3 "${caller}" property don't accept "${value}" (any number) as a value.`);
        return false;
        // throw new Error(`v-money3 "${caller}" property don't accept any number "${value}" as a value.`);
      }
    }
    return true;
  }

  static validateRestrictedOptions(opt) {
    for (const target of RESTRICTED_OPTIONS) {
      Utils.validateRestrictedInput(opt[target], target);
    }
    return true;
  }

  static filterRestrictedCharactersFromRestrictedOptions(opt) {
    for (const option of RESTRICTED_OPTIONS) {
      for (const character of RESTRICTED_CHARACTERS) {
        opt[option] = opt[option].replaceAll(character, '');
      }
    }
    return opt;
  }

  static filterNumbersFromOption(opt, option) {
    opt[option] = opt[option].replace(/\d+/g, '');
    return opt;
  }

  static filterOptRestrictions(opt) {
    opt = Utils.filterRestrictedCharactersFromRestrictedOptions(opt);

    opt = Utils.filterNumbersFromOption(opt, 'prefix');
    opt = Utils.filterNumbersFromOption(opt, 'suffix');

    return opt;
  }

  static guessFloatPrecision(string) {
    const total = string.length;
    const index = string.indexOf('.');
    return total - (index + 1);
  }

  static removeLeadingZeros(string) {
    return string.replace(/^(-?)0+(?!\.)(.+)/, '$1$2');
  }

  static isValidInteger(str) {
    return (/^-?[\d]+$/g).test(str);
  }

  static isValidFloat(str) {
    return (/^-?[\d]+(\.[\d]+)$/g).test(str);
  }

  static replaceAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  static round(string, precision) {
    const diff = precision - Utils.guessFloatPrecision(string);
    if (diff >= 0) {
      return string;
    }

    let firstPiece = string.slice(0, diff);
    const lastPiece = string.slice(diff);

    if (firstPiece.charAt(firstPiece.length - 1) === '.') {
      firstPiece = firstPiece.slice(0, -1);
    }

    if (parseInt(lastPiece.charAt(0), 10) >= 5) {
      for (let i = firstPiece.length - 1; i >= 0; i -= 1) {
        const char = firstPiece.charAt(i);
        if (char !== '.' && char !== '-') {
          const newValue = parseInt(char, 10) + 1;
          if (newValue < 10) {
            return Utils.replaceAt(firstPiece, i, newValue);
          }

          firstPiece = Utils.replaceAt(firstPiece, i, '0');
        }
      }

      return `1${firstPiece}`;
    }
    return firstPiece;
  }

  static setCursor(el, position) {
    const setSelectionRange = () => {
      el.setSelectionRange(position, position);
    };
    if (el === document.activeElement) {
      setSelectionRange();
      setTimeout(setSelectionRange, 1); // Android Fix
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
  static event(name) {
    const evt = document.createEvent('Event');
    evt.initEvent(name, true, true);
    return evt;
  }
}

export default Utils;
export { RESTRICTED_CHARACTERS, RESTRICTED_OPTIONS };
