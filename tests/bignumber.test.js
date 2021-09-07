import BigNumber from '../src/BigNumber';

test('test getNumber function', () => {
  const number = new BigNumber('1234.567');

  expect(number.getNumber()).toBe(1234567n);
});

test('test getDecimalPrecision function', () => {
  const number = new BigNumber('1234.567');

  expect(number.getDecimalPrecision()).toBe(3);
});

test('test setNumber function', () => {
  const number = new BigNumber('0');

  number.setNumber('0.00');

  expect(number.getNumber()).toBe(0n);
  expect(number.getDecimalPrecision()).toBe(2);

  number.setNumber(12n);

  expect(number.getNumber()).toBe(12n);
  expect(number.getDecimalPrecision()).toBe(0);

  number.setNumber(123);

  expect(number.getNumber()).toBe(123n);
  expect(number.getDecimalPrecision()).toBe(0);

  number.setNumber(12.3);

  expect(number.getNumber()).toBe(123n);
  expect(number.getDecimalPrecision()).toBe(1);

  number.setNumber(12.345);

  expect(number.getNumber()).toBe(12345n);
  expect(number.getDecimalPrecision()).toBe(3);

  number.setNumber('12.345678901234567890');

  expect(number.getNumber()).toBe(12345678901234567890n);
  expect(number.getDecimalPrecision()).toBe(18);

  try {
    number.setNumber(['123.456.7']);
  } catch (e) {
    const includes = e.message.includes('BigNumber has received and invalid typeof');
    expect(includes).toBe(true);
  }
});

test('test setupString function', () => {
  const number = new BigNumber('0');

  number.setupString('1');

  expect(number.getNumber()).toBe(1n);
  expect(number.getDecimalPrecision()).toBe(0);

  number.setupString('1.1');

  expect(number.getNumber()).toBe(11n);
  expect(number.getDecimalPrecision()).toBe(1);

  number.setupString('-1.23');

  expect(number.getNumber()).toBe(-123n);
  expect(number.getDecimalPrecision()).toBe(2);

  number.setupString('1.234567890123456789012345');

  expect(number.getNumber()).toBe(1234567890123456789012345n);
  expect(number.getDecimalPrecision()).toBe(24);

  try {
    number.setupString('123.456.7');
  } catch (e) {
    const includes = e.message.includes('BigNumber has received and invalid format for the constructor');
    expect(includes).toBe(true);
  }
});

test('test toFixed function', () => {
  const array = [
    // shouldRound
    {
      number: 1, precision: 0, round: true, target: '1',
    },
    {
      number: '1', precision: 3, round: true, target: '1.000',
    },
    {
      number: '123', precision: 2, round: true, target: '123.00',
    },
    {
      number: '111.111', precision: 2, round: true, target: '111.11',
    },
    {
      number: '-8888.8888', precision: 1, round: true, target: '-8888.9',
    },
    {
      number: '777.777', precision: 2, round: true, target: '777.78',
    },
    {
      number: '123.45', precision: 3, round: true, target: '123.450',
    },
    {
      number: '-123.45', precision: 3, round: true, target: '-123.450',
    },
    {
      number: '8.8888', precision: 1, round: true, target: '8.9',
    },
    {
      number: '9.9999', precision: 2, round: true, target: '10.00',
    },
    // shouldNotRound
    {
      number: '111.111', precision: 2, round: false, target: '111.11',
    },
    {
      number: '9.9999', precision: 2, round: false, target: '9.99',
    },
    {
      number: '8.8888', precision: 1, round: false, target: '8.8',
    },
    {
      number: '777.777', precision: 2, round: false, target: '777.77',
    },
    {
      number: '666.6666', precision: 3, round: false, target: '666.666',
    },
    {
      number: '555.55555', precision: 4, round: false, target: '555.5555',
    },
    {
      number: '-8888.8888', precision: 1, round: false, target: '-8888.8',
    },
  ];
  for (const item of array) {
    const number = new BigNumber(item.number);
    expect(number.toFixed(item.precision, item.round)).toBe(item.target);
  }

  // test coverage
  const number = new BigNumber('123456');
  expect(number.toFixed()).toBe('123456');
});

test('test toString function', () => {
  const array = [
    { number: 1, target: '1' },
    { number: 1.2, target: '1.2' },
    { number: -1.1, target: '-1.1' },
    { number: 2n, target: '2' },
    { number: '-00.11', target: '-0.11' },
    { number: '000111234567.8912345678989123456789', target: '111234567.8912345678989123456789' },
    { number: '1.00', target: '1.00' },
    { number: '0.11', target: '0.11' },
    { number: '0.01', target: '0.01' },
    { number: '0.00', target: '0.00' },
    { number: '1.00', target: '1.00' },
    { number: '123.00', target: '123.00' },
    { number: '123.45', target: '123.45' },
  ];

  for (const item of array) {
    const number = new BigNumber(item.number);
    expect(number.toString()).toBe(item.target);
  }
});

test('test lessThan function', () => {
  const less = [
    { number1: '1', number2: '2' },
    { number1: '1.1', number2: '1.2' },
    { number1: '-1.2', number2: '-1.1' },
    { number1: '999', number2: '1000' },
    { number1: '99999999999999999999999999999', number2: '999999999999999999999999999999' },
  ];

  for (const item of less) {
    const number = new BigNumber(item.number1);
    expect(number.lessThan(item.number2)).toBe(true);
  }

  const notLess = [
    { number1: '1', number2: '1' },
    { number1: '2', number2: '1' },
    { number1: '-1.1', number2: '-1.2' },
  ];

  for (const item of notLess) {
    const number = new BigNumber(item.number1);
    expect(number.lessThan(item.number2)).toBe(false);
  }
});

test('test biggerThan function', () => {
  const bigger = [
    { number1: '2', number2: '1' },
    { number1: '1.2', number2: '1.1' },
    { number1: '-1.1', number2: '-1.2' },
    { number1: '1000', number2: '999' },
    { number1: '999999999999999999999999999999', number2: '99999999999999999999999999999' },
  ];

  for (const item of bigger) {
    const number = new BigNumber(item.number1);
    expect(number.biggerThan(item.number2)).toBe(true);
  }

  const notBigger = [
    { number1: '1', number2: '1' },
    { number1: '1', number2: '2' },
    { number1: '-1.2', number2: '-1.1' },
  ];

  for (const item of notBigger) {
    const number = new BigNumber(item.number1);
    expect(number.biggerThan(item.number2)).toBe(false);
  }
});

test('test isEqual function', () => {
  const equal = [
    { number1: '123456', number2: '123456' },
    { number1: '123.45', number2: '123.45' },
    { number1: '-123.45', number2: '-123.45' },
    { number1: '-123.456789123456789123456789', number2: '-123.456789123456789123456789' },
  ];

  for (const item of equal) {
    const number = new BigNumber(item.number1);
    expect(number.isEqual(item.number2)).toBe(true);
  }

  const notEqual = [
    { number1: '123456', number2: '1234567' },
    { number1: '123.45', number2: '123.457' },
    { number1: '-123.45', number2: '-123.457' },
  ];

  for (const item of notEqual) {
    const number = new BigNumber(item.number1);
    expect(number.isEqual(item.number2)).toBe(false);
  }
});

test('test adjustComparisonNumbers function', () => {
  const tests = [
    {
      number1: '123.45', number2: '123.456', target1: 123450n, target2: 123456n,
    },
    {
      number1: '123.4567', number2: '123.45', target1: 1234567n, target2: 1234500n,
    },
    {
      number1: '123.45', number2: '123.45', target1: 12345n, target2: 12345n,
    },
    {
      number1: '1.1', number2: '12345.3', target1: 11n, target2: 123453n,
    },
    {
      number1: '1.111111', number2: '2222222.3', target1: 1111111n, target2: 2222222300000n,
    },
  ];
  for (const item of tests) {
    const number1 = new BigNumber(item.number1);
    const number2 = new BigNumber(item.number2);

    const adjusted = number1.adjustComparisonNumbers(number2);
    expect(adjusted[0]).toBe(item.target1);
    expect(adjusted[1]).toBe(item.target2);
  }
});
