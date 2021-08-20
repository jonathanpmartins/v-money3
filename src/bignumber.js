class BigNumber {
  constructor(number) {
    console.log('BigNumber.constructor', number);
    console.log('BigNumber.constructor typeof', typeof number);

    this.setNumber(number);

    console.log('BigNumber.decimal', this.decimal);
    console.log('BigNumber.number', this.number);
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
    number = BigNumber.removeLeadingZeros(number);

    if (BigNumber.isValidInteger(number)) {
      this.number = BigInt(number);
    } else if (BigNumber.isValidFloat(number)) {
      this.decimal = BigNumber.guessFloatPrecision(number);
      this.number = BigInt(number.replace('.', ''));
    } else {
      throw new Error(`BigNumber has received and invalid format for the constructor: ${number}`);
    }
  }

  getNumber() {
    return this.number;
  }

  getDecimalPrecision() {
    return this.decimal;
  }

  toString() {
    // Number(15).toFixed()
    let string = this.number.toString();
    // console.log('BigNumber.toString() - string1', string);
    if (this.decimal) {
      let isNegative = false;
      if (string.charAt(0) === '-') {
        string = string.substring(1);
        isNegative = true;
        // console.log('BigNumber.toString() - isNegative!!!!!!!!!!!!');
      }
      // string = string.charAt(0) === '-' ? string.substring(1) : string;

      string = `${string.slice(0, -this.decimal)}.${string.slice(-this.decimal)}`;
      if (string.charAt(0) === '.') {
        string = `0${string}`;
      }
      // console.log('BigNumber.toString() - sliced', sliced);
      return (isNegative ? '-' : '') + string;
    }
    // console.log('BigNumber.toString() - string2', string);
    return string;
  }

  toFixed(integer) {
    // console.log('BigNumber.toFixed() - integer', integer);
    let string = this.toString();
    const diff = integer - this.getDecimalPrecision();
    // console.log('BigNumber.toFixed() - diff', diff);
    // diff bigger than zero pads zeros at the end
    if (diff > 0) {
      // if it is an integer, add a dot
      if (!string.includes('.')) {
        string += '.';
      }
      // console.log('BigNumber.toFixed() - string diff > 0', string.padEnd(string.length + diff, '0'));
      return string.padEnd(string.length + diff, '0');
    }
    // diff smaller than zero need to be sliced
    if (diff < 0) {
      // console.log('BigNumber.toFixed() - string string < 0', string.slice(diff));
      return string.slice(diff);
    }
    // console.log('BigNumber.toFixed() - string == ??', string);
    return string;
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
      // console.log('BigNumber.adjustComparisonNumbers() - thatNumber.getNumber()', thatNumber.getNumber());
      // console.log('BigNumber.adjustComparisonNumbers() - thatNum', thatNum);
    } else if (diff < 0) {
      thisNum = this.getNumber() * (10n ** BigInt(diff));
      thatNum = thatNumber.getNumber();
    } else {
      thisNum = this.getNumber();
      thatNum = thatNumber.getNumber();
    }

    return [thisNum, thatNum];
  }

  lessThan(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    // console.log('BigNumber.lessThan() number 0', numbers[0]);
    // console.log('BigNumber.lessThan() number 0 typeof', typeof numbers[0]);
    // console.log('BigNumber.lessThan() number 1', numbers[1]);
    // console.log('BigNumber.lessThan() number 1 typeof', typeof numbers[1]);
    // console.log('BigNumber.lessThan() result', numbers[0] < numbers[1]);
    return numbers[0] < numbers[1];
  }

  biggerThan(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    // console.log('BigNumber.biggerThan() number 0', numbers[0]);
    // console.log('BigNumber.biggerThan() number 0 typeof', typeof numbers[0]);
    // console.log('BigNumber.biggerThan() number 1', numbers[1]);
    // console.log('BigNumber.biggerThan() number 1 typeof', typeof numbers[1]);
    // console.log('BigNumber.biggerThan() result', numbers[0] > numbers[1]);
    return numbers[0] > numbers[1];
  }

  isEqual(thatBigNumber) {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] === numbers[1];
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
    return (/^-?[\d]+(\.[\d]+)?$/g).test(str);
  }
}

export default BigNumber;
