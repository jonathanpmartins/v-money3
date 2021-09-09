import Utils from './Utils';

type NumberParam = number|string|BigInt;

// @ts-ignore
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
BigInt.prototype.toJSON = function () {
  return this.toString();
}

export default class BigNumber {
  private number?: BigInt;
  private decimal?: number;

  constructor(number: NumberParam) {
    this.setNumber(number);
  }

  getNumber(): BigInt {
    return this.number!;
  }

  getDecimalPrecision(): number {
    return this.decimal!;
  }

  setNumber(number: any): void {
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

  setupString(number: string): void {
    number = Utils.removeLeadingZeros(number);

    if (Utils.isValidInteger(number)) {
      this.number = BigInt(number);
    } else if (Utils.isValidFloat(number)) {
      this.decimal = Utils.guessFloatPrecision(number);
      this.number = BigInt(number.replace('.', ''));
    } else {
      throw new Error(`BigNumber has received and invalid format for the constructor: ${number}`);
    }
  }

  toFixed(precision = 0, shouldRound = true): string {
    let string = this.toString();
    const diff = precision - this.getDecimalPrecision();
    if (diff > 0) {
      // diff bigger than zero pads zeros at the end
      if (!string.includes('.')) {
        // if it is an integer, add a dot
        string += '.';
      }
      return string.padEnd(string.length + diff, '0');
    }
    if (diff < 0) {
      // diff smaller than zero need to be sliced...
      if (shouldRound) {
        // ... and rounded
        return Utils.round(string, precision);
      }
      return string.slice(0, diff);
    }
    return string;
  }

  toString(): string {
    let string = this.number!.toString();
    if (this.decimal) {
      let isNegative = false;
      if (string.charAt(0) === '-') {
        string = string.substring(1);
        isNegative = true;
      }
      string = string.padStart(string.length + this.decimal, '0');
      string = `${string.slice(0, -this.decimal)}.${string.slice(-this.decimal)}`;
      string = Utils.removeLeadingZeros(string);

      return (isNegative ? '-' : '') + string;
    }
    return string;
  }

  lessThan(thatBigNumber: NumberParam|BigNumber): boolean {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] < numbers[1];
  }

  biggerThan(thatBigNumber: NumberParam|BigNumber): boolean {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] > numbers[1];
  }

  isEqual(thatBigNumber: NumberParam|BigNumber): boolean {
    const numbers = this.adjustComparisonNumbers(thatBigNumber);
    return numbers[0] === numbers[1];
  }

  adjustComparisonNumbers(thatNumberParam: NumberParam|BigNumber): BigInt[] {
    let thatNumber: BigNumber;
    if (thatNumberParam.constructor.name !== 'BigNumber') {
      thatNumber = new BigNumber(thatNumberParam as NumberParam);
    } else {
      thatNumber = thatNumberParam as BigNumber;
    }

    const diff = this.getDecimalPrecision() - thatNumber.getDecimalPrecision();

    let thisNum: BigInt;
    let thatNum: BigInt;

    if (diff > 0) {
      thisNum = this.getNumber();
      // @ts-ignore
      thatNum = thatNumber.getNumber() * (10n ** BigInt(diff));
    } else if (diff < 0) {
      // @ts-ignore
      thisNum = this.getNumber() * (10n ** BigInt(diff * -1));
      thatNum = thatNumber.getNumber();
    } else {
      thisNum = this.getNumber();
      thatNum = thatNumber.getNumber();
    }

    return [thisNum, thatNum];
  }
};
