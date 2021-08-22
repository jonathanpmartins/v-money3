class BigNumber {
  constructor(number) {
    this.setNumber(number);
  }

  getNumber() {
    return this.number;
  }

  getDecimalPrecision() {
    return this.decimal;
  }

  setNumber(number) {
    this.decimal = 0;

    if (typeof number === 'bigint') {
      this.number = number;
    } else if (typeof number === 'number') {
      this.setupString(number.toString());
    } else if (typeof number === 'string') {
      this.setupString(number);
    } else {
      throw new Error(`BigNumber has received and invalid typeof: ${typeof number}. Only bigint, number and string are permitted.`);
    }
  }

  setupString(number) {
    number = this.constructor.removeLeadingZeros(number);

    if (this.constructor.isValidInteger(number)) {
      this.number = BigInt(number);
    } else if (this.constructor.isValidFloat(number)) {
      this.decimal = this.constructor.guessFloatPrecision(number);
      this.number = BigInt(number.replace('.', ''));
    } else {
      throw new Error(`BigNumber has received and invalid format for the constructor: ${number}`);
    }
  }

  toFixed(precision = 0) {
    let string = this.toString();
    const diff = precision - this.getDecimalPrecision();
    // diff bigger than zero pads zeros at the end
    if (diff > 0) {
      // if it is an integer, add a dot
      if (!string.includes('.')) {
        string += '.';
      }
      return string.padEnd(string.length + diff, '0');
    }
    // diff smaller than zero need to be sliced and rounded
    if (diff < 0) {
      return this.constructor.round(string, precision);
    }
    return string;
  }

  toString() {
    let string = this.number.toString();
    if (this.decimal) {
      let isNegative = false;
      if (string.charAt(0) === '-') {
        string = string.substring(1);
        isNegative = true;
      }
      string = string.padStart(string.length + this.decimal, '0');
      string = `${string.slice(0, -this.decimal)}.${string.slice(-this.decimal)}`;
      string = this.constructor.removeLeadingZeros(string);

      return (isNegative ? '-' : '') + string;
    }
    return string;
  }

  lessThan(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] < numbers[1];
  }

  biggerThan(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] > numbers[1];
  }

  isEqual(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] === numbers[1];
  }

  adjustComparisonNumbers(thatNumber) {
    if (thatNumber.constructor.name !== 'BigNumber') {
      thatNumber = new BigNumber(thatNumber);
    }

    const diff = this.getDecimalPrecision() - thatNumber.getDecimalPrecision();

    let thisNum;
    let thatNum;

    if (diff > 0) {
      thisNum = this.getNumber();
      thatNum = thatNumber.getNumber() * (10n ** BigInt(diff));
    } else if (diff < 0) {
      thisNum = this.getNumber() * (10n ** BigInt(diff * -1));
      thatNum = thatNumber.getNumber();
    } else {
      thisNum = this.getNumber();
      thatNum = thatNumber.getNumber();
    }

    return [thisNum, thatNum];
  }

  static replaceAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  static round(string, precision) {
    const diff = precision - BigNumber.guessFloatPrecision(string);
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
            return BigNumber.replaceAt(firstPiece, i, newValue);
          }

          firstPiece = BigNumber.replaceAt(firstPiece, i, '0');
        }
      }

      return `1${firstPiece}`;
    }
    return firstPiece;
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
}

export default BigNumber;
