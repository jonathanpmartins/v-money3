import BigNumber from '../../../src/BigNumber';

test('adjustComparisonNumbers breaks when BigNumber class name is renamed (minification)', () => {
  const a = new BigNumber('5');
  const b = new BigNumber('10');

  const orig = Object.getOwnPropertyDescriptor(BigNumber, 'name');
  Object.defineProperty(BigNumber, 'name', { value: 'x', configurable: true });

  try {
    expect(() => a.biggerThan(b)).not.toThrow();
    expect(a.biggerThan(b)).toBe(false);
    expect(b.biggerThan(a)).toBe(true);
  } finally {
    if (orig) Object.defineProperty(BigNumber, 'name', orig);
  }
});
