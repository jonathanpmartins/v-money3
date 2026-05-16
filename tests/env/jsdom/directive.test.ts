/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import Money3Directive from '../../../src/directive';

function makeHost() {
  return {
    template: '<input v-money3="opts" />',
    props: {
      opts: { type: Object, required: true },
    },
  } as const;
}

const directives = { money3: Money3Directive };

beforeEach(() => {
  jest.restoreAllMocks();
});

test('#99 directive — precision change on bare directive warns and preserves display', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const host = makeHost();
  const wrapper = mount(host, {
    props: {
      opts: {
        precision: 2,
        decimal: ',',
        thousands: '.',
        prefix: '',
        suffix: '',
        disableNegative: false,
        min: `${Number.MIN_SAFE_INTEGER}`,
        max: `${Number.MAX_SAFE_INTEGER}`,
        allowBlank: false,
        treatZeroAsBlank: false,
        minimumNumberOfCharacters: 0,
        modelModifiers: { number: false },
        shouldRound: true,
        focusOnRight: false,
      },
    },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('222');
  // After directive setValue on input event, value becomes "2,22"
  expect(input.element.value).toBe('2,22');

  await wrapper.setProps({
    opts: {
      ...wrapper.props('opts'),
      precision: 3,
    },
  });

  expect(input.element.value).toBe('2,22'); // unchanged
  expect(warnSpy).toHaveBeenCalledTimes(1);
  expect(warnSpy.mock.calls[0][0]).toMatch(/v-money3/);
  expect(warnSpy.mock.calls[0][0]).toMatch(/precision|format options|remount|Money3 component/i);
});

test('#99 directive — opts unchanged across re-render does not warn', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const host = makeHost();
  const initialOpts = {
    precision: 2,
    decimal: ',',
    thousands: '.',
    prefix: '',
    suffix: '',
    disableNegative: false,
    min: `${Number.MIN_SAFE_INTEGER}`,
    max: `${Number.MAX_SAFE_INTEGER}`,
    allowBlank: false,
    treatZeroAsBlank: false,
    minimumNumberOfCharacters: 0,
    modelModifiers: { number: false },
    shouldRound: true,
    focusOnRight: false,
  };
  const wrapper = mount(host, {
    props: { opts: initialOpts },
    global: { directives },
  });

  await wrapper.find('input').setValue('222');

  // Re-render with identical opts (new object reference, same values)
  await wrapper.setProps({ opts: { ...initialOpts } });

  expect(warnSpy).not.toHaveBeenCalled();
});

test('#99 directive — opts change with empty el.value does not warn', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const host = makeHost();
  const initialOpts = {
    precision: 2,
    decimal: ',',
    thousands: '.',
    prefix: '',
    suffix: '',
    disableNegative: false,
    min: `${Number.MIN_SAFE_INTEGER}`,
    max: `${Number.MAX_SAFE_INTEGER}`,
    allowBlank: true,
    treatZeroAsBlank: false,
    minimumNumberOfCharacters: 0,
    modelModifiers: { number: false },
    shouldRound: true,
    focusOnRight: false,
  };
  const wrapper = mount(host, {
    props: { opts: initialOpts },
    global: { directives },
  });
  expect(wrapper.find('input').element.value).toBe('');

  await wrapper.setProps({
    opts: { ...initialOpts, precision: 3 },
  });

  expect(warnSpy).not.toHaveBeenCalled();
});
