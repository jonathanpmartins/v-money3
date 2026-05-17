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

  expect(input.element.value).toBe('1.50');
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

test('directive — onKeyDown + key on negative value flips sign and keeps formatting', async () => {
  // Pressing "+" on a negative value should flip the sign and leave the
  // input in the same formatted shape (prefix, thousands, precision, suffix).
  // The current implementation assigns el.value = String(number * -1) raw,
  // skipping format() and producing "1.5" instead of "1.50".
  const wrapper = mount(makeHost(), {
    props: {
      opts: {
        ...baseOpts,
        prefix: 'R$ ',
        thousands: ',',
        decimal: '.',
      },
    },
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('-1234567'); // typed digits with leading '-'
  expect(input.element.value).toBe('R$ -12,345.67');

  await input.trigger('keydown', { key: '+' });

  expect(input.element.value).toBe('R$ 12,345.67');
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

test('directive — Backspace clears zero when allowBlank + treatZeroAsBlank (no .number modifier)', async () => {
  // Same scenario as the test above, but WITHOUT modelModifiers.number.
  // unformat() then returns a string ("0.00"), and the directive's
  // `unformat(...) === 0` strict-equality check silently fails — leaving
  // the input stuck at "0.00" instead of clearing.
  const wrapper = mount(makeHost(), {
    props: {
      opts: {
        ...baseOpts,
        allowBlank: true,
        treatZeroAsBlank: true,
        // modelModifiers.number intentionally left false (default)
      },
    },
    global: { directives },
  });

  const input = wrapper.find('input');
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

test('#100 directive — updated on non-input host resolves inner input before setValue', async () => {
  // Regression for #100: Nuxt UI's UInput renders a wrapper element with the
  // <input> inside. In v3.24.1 updated() called setValue() with the host (a
  // <div>) instead of the inner input, so el.value was undefined and the
  // positionFromEnd line threw "Cannot read properties of undefined (reading
  // 'length')". resolveInner() must run on the update path too.
  const wrapper = mount(makeFlexibleHost('<div v-money3="opts"><input /></div>'), {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('-150');
  expect(input.element.value).toBe('-1.50');

  // Non-format-affecting opt change → updated() falls through to setValue().
  // Without the fix this throws on the wrapper <div>.
  await wrapper.setProps({ opts: { ...baseOpts, disableNegative: true } } as never);

  expect(input.element.value).toBe('1.50');
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

test('directive — beforeUnmount clears event listeners on nested input (non-input host)', async () => {
  const wrapper = mount(makeFlexibleHost('<div v-money3="opts"><input /></div>'), {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input').element;
  // listeners were attached to the inner <input>, not the <div> host
  expect(input.onkeydown).not.toBeNull();
  expect(input.oninput).not.toBeNull();
  expect(input.onfocus).not.toBeNull();

  wrapper.unmount();

  // bug: beforeUnmount receives the <div> host and nulls listeners on the wrong
  // node, so the inner <input> keeps its handlers attached after unmount.
  expect(input.onkeydown).toBeNull();
  expect(input.oninput).toBeNull();
  expect(input.onfocus).toBeNull();
});

// ---- #78: wrapper component v-model off-by-10 ----

// Vuetify <v-text-field> renders its inner <input> with an `@input` listener
// attached at template-render time — i.e. BEFORE the parent's v-money3
// directive mounts. DOM listener-order = registration-order at the target
// phase, so the wrapper's listener captured the pre-reformat keystroke value,
// leaving the host's v-model one character behind.
//
// We simulate the wrapper without pulling Vuetify into the test deps: any
// component that wraps an <input> and re-emits its raw value on `@input`
// reproduces the exact ordering.

const VuetifyLikeInput = {
  template: '<div class="v-input"><div class="v-field"><input class="v-field__input" :value="modelValue" @input="onInput" /></div></div>',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  methods: {
    onInput(e: Event) {
      (this as unknown as { $emit: (n: string, v: string) => void })
        .$emit('update:modelValue', (e.target as HTMLInputElement).value);
    },
  },
};

const NuxtUInputLike = {
  // UInput from Nuxt UI wraps the <input> behind extra DOM (icon slot,
  // helper text, etc.). Same emit shape — re-emit raw value on @input.
  template: '<div class="u-input"><span class="u-icon" /><input :value="modelValue" @input="onInput" /><span class="u-helper" /></div>',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  methods: {
    onInput(e: Event) {
      (this as unknown as { $emit: (n: string, v: string) => void })
        .$emit('update:modelValue', (e.target as HTMLInputElement).value);
    },
  },
};

test('#78 directive — Vuetify-like wrapper v-model captures formatted (not pre-format) value', async () => {
  const parent = {
    components: { VuetifyLikeInput },
    template: '<VuetifyLikeInput v-money3="opts" v-model="model" />',
    props: ['opts'],
    data() { return { model: '' }; },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input').element as HTMLInputElement;
  await wrapper.find('input').setValue('789');

  // The directive reformats the DOM value to "7.89".
  expect(input.value).toBe('7.89');
  // Without the fix, the wrapper's @input listener fires first and emits
  // "789", so the parent's v-model captures the raw pre-format value and
  // stays off-by-10 forever. After the fix, the directive re-dispatches an
  // input event with the formatted value and the wrapper re-emits "7.89".
  expect((wrapper.vm as unknown as { model: string }).model).toBe('7.89');
});

test('#78 directive — Nuxt UInput-like wrapper v-model captures formatted value', async () => {
  const parent = {
    components: { NuxtUInputLike },
    template: '<NuxtUInputLike v-money3="opts" v-model="model" />',
    props: ['opts'],
    data() { return { model: '' }; },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input').element as HTMLInputElement;
  await wrapper.find('input').setValue('1234');

  expect(input.value).toBe('12.34');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('12.34');
});

test('#78 directive — wrapper synth re-fire is guarded against recursion', async () => {
  // The directive emits a synthetic `input` event after reformatting on a
  // wrapper host. If the SYNTH_FLAG guard were missing, our own oninput
  // would re-enter setValue and re-dispatch indefinitely. Cap dispatches
  // and assert we stay below the recursion threshold.
  let synthDispatched = 0;
  const wrapper = mount(makeFlexibleHost('<div v-money3="opts"><input /></div>'), {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const inputEl = wrapper.find('input').element as HTMLInputElement;
  inputEl.addEventListener('input', (e: Event) => {
    if ((e as Event & Record<string, unknown>).__v_money3_synth__) synthDispatched += 1;
  });

  await wrapper.find('input').setValue('500');

  expect(inputEl.value).toBe('5.00');
  // Exactly one synth `input` event per setValue call. >1 means the
  // SYNTH_FLAG guard regressed and onInput re-entered setValue.
  expect(synthDispatched).toBe(1);
});

const ElementPlusLikeInput = {
  // el-input shape: <div class="el-input"><input … @input /></div>. Same emit
  // contract — re-emit raw value on @input.
  template: '<div class="el-input"><div class="el-input__wrapper"><input :value="modelValue" @input="onInput" /></div></div>',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  methods: {
    onInput(e: Event) {
      (this as unknown as { $emit: (n: string, v: string) => void })
        .$emit('update:modelValue', (e.target as HTMLInputElement).value);
    },
  },
};

test('#78 directive — Element Plus-like wrapper v-model captures formatted value', async () => {
  const parent = {
    components: { ElementPlusLikeInput },
    template: '<ElementPlusLikeInput v-money3="opts" v-model="model" />',
    props: ['opts'],
    data() { return { model: '' }; },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input').element as HTMLInputElement;
  await wrapper.find('input').setValue('5000');

  expect(input.value).toBe('50.00');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('50.00');
});

test('#78 directive — synth input event does NOT bubble to ancestor listeners', async () => {
  // bubbles: false on the synth event means an @input listener on the wrapper
  // host (or any ancestor) only sees the original user-driven event, not the
  // directive's re-dispatch. Without this, userland code listening on a parent
  // <div> / <form> would receive a duplicate event with no obvious reason to
  // filter it out.
  let ancestorCount = 0;
  const parent = {
    components: { VuetifyLikeInput },
    template: '<div @input="onAncestor"><VuetifyLikeInput v-money3="opts" v-model="model" /></div>',
    props: ['opts'],
    data() { return { model: '' }; },
    methods: {
      onAncestor() { ancestorCount += 1; },
    },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  await wrapper.find('input').setValue('250');

  // The original user-driven input event bubbles up (counted once). The synth
  // event from the directive's re-dispatch is bubbles:false → not counted.
  expect(ancestorCount).toBe(1);
  expect((wrapper.vm as unknown as { model: string }).model).toBe('2.50');
});

test('#78 directive — wrapper v-model tracks value across backspace (shorter input)', async () => {
  // Hardens the wrapper path against value-shortening inputs. Browser backspace
  // is simulated by setValue() rewriting to a shorter string and dispatching
  // input — the directive must still reformat and re-emit so the wrapper's
  // v-model lands on the shorter formatted value, not stale prior state.
  const parent = {
    components: { VuetifyLikeInput },
    template: '<VuetifyLikeInput v-money3="opts" v-model="model" />',
    props: ['opts'],
    data() { return { model: '' }; },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  await input.setValue('12345');
  expect((input.element as HTMLInputElement).value).toBe('123.45');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('123.45');

  // Backspace-like shortening — user deleted trailing digit(s).
  await input.setValue('1234');
  expect((input.element as HTMLInputElement).value).toBe('12.34');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('12.34');

  // Further deletion down to a single digit.
  await input.setValue('1');
  expect((input.element as HTMLInputElement).value).toBe('0.01');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('0.01');
});

test('#78 directive — wrapper v-model tracks value across paste (large input)', async () => {
  // Paste replaces the value in one shot. The synth re-fire must still
  // propagate the formatted value to the wrapper's v-model regardless of
  // jump magnitude.
  const parent = {
    components: { VuetifyLikeInput },
    template: '<VuetifyLikeInput v-money3="opts" v-model="model" />',
    props: ['opts'],
    data() { return { model: '' }; },
  };

  const wrapper = mount(parent, {
    props: { opts: { ...baseOpts } } as never,
    global: { directives },
  });

  const input = wrapper.find('input');
  // Simulated paste of a long pre-formatted string. The dot is stripped along
  // with any other non-digit, and precision 2 anchors the last two digits as
  // the fractional part, so "1234567.89" → digits "123456789" → "1,234,567.89".
  await input.setValue('1234567.89');
  expect((input.element as HTMLInputElement).value).toBe('1,234,567.89');
  expect((wrapper.vm as unknown as { model: string }).model).toBe('1,234,567.89');
});

test('#78 directive — native <input> host does NOT re-fire input event', async () => {
  // Regression guard: native hosts must keep current behavior — Vue's
  // vModelText listener already sees the formatted value, no synth event
  // needed, and emitting one would surface duplicate `@input` handlers
  // to userland code. Verify zero synth dispatches happen on a plain
  // <input> host.
  const synthCount = { n: 0 };
  const wrapper = mount(makeHost(), {
    props: { opts: { ...baseOpts } },
    global: { directives },
  });

  const inputEl = wrapper.find('input').element as HTMLInputElement;
  inputEl.addEventListener('input', (e: Event) => {
    if ((e as Event & Record<string, unknown>).__v_money3_synth__) synthCount.n += 1;
  });

  await wrapper.find('input').setValue('250');
  expect(inputEl.value).toBe('2.50');
  expect(synthCount.n).toBe(0);
});
