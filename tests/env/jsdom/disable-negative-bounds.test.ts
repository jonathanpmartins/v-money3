import format from '../../../src/format';
import defaults from '../../../src/options';

test('disableNegative + negative max still emits negative output', () => {
  // `disableNegative` strips the sign on input, but if `max` is negative and
  // forces a clamp via bigNumber.setNumber(opt.max), the BigNumber is now
  // negative and toFixed() reattaches a leading '-' to the output. The
  // resulting display contradicts disableNegative=true. Either reject
  // negative bounds when disableNegative is on, or re-strip the sign after
  // the min/max clamp.
  const out = format(10, { ...defaults, disableNegative: true, max: -5 });
  expect(out.startsWith('-')).toBe(false);
});

test('disableNegative + negative min ignored on positive input (low-impact, documented)', () => {
  // A positive value will never be `lessThan(-5)`, so min=-5 is effectively
  // dead under disableNegative=true. Documented here so behavior is locked.
  expect(format(3, { ...defaults, disableNegative: true, min: -5 })).toBe('3.00');
});
