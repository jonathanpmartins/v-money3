/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import * as Utils from '../../../src/Utils';
import Money3Directive from '../../../src/directive';

function makeHost() {
  return {
    template: '<input v-money3="opts" />',
    props: {
      opts: { type: Object, required: true },
    },
  } as const;
}

function makeFlexibleHost(template: string) {
  return {
    template,
    props: ['opts'],
  } as const;
}

const baseOpts = {
  precision: 2,
  decimal: '.',
  thousands: ',',
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

test('directive — oninput pre-formats single digit 1-9', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('5');

  expect(input.element.value).toBe('0.05');
});

test('directive — onKeyDown + key flips negative to positive', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('-150');
  expect(input.element.value).toBe('-1.50');

  await input.trigger('keydown', { key: '+' });

  expect(input.element.value).toBe('1.5');
});

test('directive — onKeyDown handles null selectionEnd', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('150');
  // Force null selectionEnd to exercise the `(el.selectionEnd || 0)` fallback.
  Object.defineProperty(input.element, 'selectionEnd', {
    value: null,
    configurable: true,
  });

  await input.trigger('keydown', { code: 'Backspace' });

  expect(input.element.value).toBe('1.50');
});

test('directive — onKeyDown + key on positive value is a no-op', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('150');
  expect(input.element.value).toBe('1.50');

  await input.trigger('keydown', { key: '+' });

  expect(input.element.value).toBe('1.50');
});

test('directive — Backspace clears zero when allowBlank + treatZeroAsBlank', async () => {
  const wrapper = mount(makeHost(), {
    props: {
      opts: {
        ...baseOpts,
        allowBlank: true,
        treatZeroAsBlank: true,
        modelModifiers: { number: true },
      },
    },
    global: { directives },
  });

  const input = wrapper.find('input');
  // Bypass format by writing directly so el.value === '0.00' when keydown fires.
  // (Normally format() collapses zero to '' under allowBlank + treatZeroAsBlank,
  // hiding the unformat()===0 branch.)
  input.element.value = '0.00';
  input.element.setSelectionRange(input.element.value.length, input.element.value.length);
  await input.trigger('keydown', { code: 'Backspace' });

  expect(input.element.value).toBe('');
});

test('directive — onFocus with focusOnRight runs without error', async () => {
  const wrapper = mount(makeHost(), {
    props: {
      opts: {
        ...baseOpts, suffix: ' %', focusOnRight: true,
      },
    },
    attachTo: document.body,
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('1234');
  expect(input.element.value).toBe('12.34 %');

  await input.trigger('focus');

  expect(input.element.value).toBe('12.34 %');

  wrapper.unmount();
});

test('directive — finds nested input on non-input host element', async () => {
  const wrapper = mount(makeFlexibleHost('<div v-money3="opts"><input /></div>'), {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('789');

  expect(input.element.value).toBe('7.89');
});

test('directive — throws when host has 0 inputs', () => {
  let caught: Error | undefined;
  try {
    mount(makeFlexibleHost('<div v-money3="opts"></div>'), {
      props: { opts: { ...baseOpts } } as never,
      global: { directives },
    });
  } catch (e) {
    caught = e as Error;
  }

  expect(caught?.message).toMatch(/v-money3 requires 1 input, found 0 elements\./);
});

test('directive — throws when host has 2 inputs', () => {
  let caught: Error | undefined;
  try {
    mount(makeFlexibleHost('<div v-money3="opts"><input /><input /></div>'), {
      props: { opts: { ...baseOpts } } as never,
      global: { directives },
    });
  } catch (e) {
    caught = e as Error;
  }

  expect(caught?.message).toMatch(/v-money3 requires 1 input, found 2 elements\./);
});

test('directive — mounted with falsy binding value attaches no listeners', async () => {
  const wrapper = mount(makeFlexibleHost('<input v-money3="opts" />'), {
    props: { opts: null },
    global: { directives },
  });

  const input = wrapper.find('input');
  expect(input.element.onkeydown).toBeNull();
  expect(input.element.oninput).toBeNull();
  expect(input.element.onfocus).toBeNull();
});

test('directive — updated with falsy binding value is a no-op', async () => {
  const wrapper = mount(makeFlexibleHost('<input v-money3="opts" />'), {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('150');
  expect(input.element.value).toBe('1.50');

  // Drop the binding — updated() must early-return on falsy binding.value.
  await wrapper.setProps({ opts: null } as never);

  expect(input.element.value).toBe('1.50');
});

test('directive — updated with non-format-affecting opts change re-runs setValue', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('-150');
  expect(input.element.value).toBe('-1.50');

  // disableNegative is NOT in FORMAT_AFFECTING_KEYS, so updated() should
  // fall through to setValue() and strip the sign instead of warning.
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await wrapper.setProps({ opts: { ...baseOpts, disableNegative: true } });

  expect(input.element.value).toBe('1.50');
  expect(warnSpy).not.toHaveBeenCalled();
});

test('directive — updated transitions from null binding to real opts without warn', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const wrapper = mount(makeFlexibleHost('<input v-money3="opts" />'), {
    props: { opts: null } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  // mounted() bailed on null. Now flip to real opts so updated() runs with
  // binding.oldValue === null — exercises the oldOpt=null / someFormatKeyChanged false branches.
  await wrapper.setProps({ opts: { ...baseOpts } } as never);
  input.element.value = '150';
  await input.trigger('input');

  expect(warnSpy).not.toHaveBeenCalled();
});

test('directive — setValue early-returns when validateRestrictedOptions fails', async () => {
  // filterOptRestrictions sanitizes inputs upstream, so this branch is only
  // reachable by forcing the validator to fail. Spy ensures the branch is
  // exercised and that el.value is not formatted.
  const spy = jest.spyOn(Utils, 'validateRestrictedOptions').mockReturnValue(false);

  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input');
  // Set raw value and trigger input — directive's setValue should bail before format.
  input.element.value = '150';
  await input.trigger('input');

  expect(input.element.value).toBe('150');
  expect(spy).toHaveBeenCalled();
});

test('directive — beforeUnmount clears event listeners', async () => {
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const input = wrapper.find('input').element;
  expect(input.onkeydown).not.toBeNull();
  expect(input.oninput).not.toBeNull();
  expect(input.onfocus).not.toBeNull();

  wrapper.unmount();

  expect(input.onkeydown).toBeNull();
  expect(input.oninput).toBeNull();
  expect(input.onfocus).toBeNull();
});
