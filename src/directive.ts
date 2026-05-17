import { DirectiveBinding, ExtractPropTypes } from 'vue';
import {
  debug,
  filterOptRestrictions,
  fixed,
  numbersToCurrency,
  setCursor,
  validateRestrictedOptions,
  event,
} from './Utils';
import format from './format';
import unformat from './unformat';
import defaults, { VMoneyOptions } from './options';
import BigNumber from './BigNumber';

// this option is used for ALL directive instances
// let opt: VMoneyOptions = defaults;

const FORMAT_AFFECTING_KEYS = [
  'precision', 'decimal', 'thousands', 'prefix', 'suffix',
  'min', 'max', 'setMaxIfBigger', 'allowBlank', 'treatZeroAsBlank',
  'minimumNumberOfCharacters', 'shouldRound', 'modelModifiers',
] as const;

const LAST_VALID_KEY = '__v_money3_last_valid__';
const IS_WRAPPER_KEY = '__v_money3_is_wrapper__';
const SYNTH_FLAG = '__v_money3_synth__';

type InputWithLastValid = HTMLInputElement & {
  [LAST_VALID_KEY]?: string;
  [IS_WRAPPER_KEY]?: boolean;
};

type SynthEvent = Event & { [SYNTH_FLAG]?: boolean };

const setValue = (
  el: HTMLInputElement,
  opt: VMoneyOptions | ExtractPropTypes<never>,
  caller: string,
) => {
  debug(opt, 'directive setValue() - caller', caller);

  if (!validateRestrictedOptions(opt)) {
    debug(opt, 'directive setValue() - validateRestrictedOptions() return false. Stopping here...', el.value);
    return;
  }

  let positionFromEnd = el.value.length - (el.selectionEnd || 0);

  const formatted = format(el.value, opt, caller);

  // setMaxIfBigger=false: format() returns the un-clamped value. Reject the
  // keystroke that pushed the numeric value past max by restoring the last
  // valid display so the input "stays at" the previous in-bounds state.
  if (
    opt.setMaxIfBigger === false
    && opt.max !== null && opt.max !== undefined && opt.max !== ''
  ) {
    const unformatted = unformat(formatted, opt, 'directive setValue overflow check');
    const bn = new BigNumber(String(unformatted));
    if (bn.biggerThan(opt.max)) {
      const lastValid = (el as InputWithLastValid)[LAST_VALID_KEY];
      if (typeof lastValid === 'string' && lastValid !== el.value) {
        el.value = lastValid;
      }
      return;
    }
  }

  if (formatted === el.value) {
    (el as InputWithLastValid)[LAST_VALID_KEY] = formatted;
    return; // prevent unnecessary updates
  }

  el.value = formatted;
  (el as InputWithLastValid)[LAST_VALID_KEY] = formatted;

  positionFromEnd = Math.max(positionFromEnd, opt.suffix.length); // right
  positionFromEnd = el.value.length - positionFromEnd;
  positionFromEnd = Math.max(positionFromEnd, opt.prefix.length); // left

  setCursor(el, positionFromEnd);

  el.dispatchEvent(event('change')); // v-model.lazy or not

  // Wrapper components (Vuetify <v-text-field>, Nuxt UI <UInput>, Element Plus
  // <el-input>, …) attach their own `@input` listener on the inner <input>
  // during render — i.e. before the directive's mounted() runs. DOM listener
  // order is registration order, so the wrapper handler fires BEFORE ours and
  // captures the pre-reformat keystroke value, leaving the host's v-model one
  // character behind the displayed value (off-by-10 in issue #78).
  //
  // After reformatting, re-emit `input` so the wrapper's listener re-reads the
  // post-format value. The SYNTH_FLAG guard prevents recursion through our own
  // onInput. Native <input> hosts (host === el) skip this — Vue's vModelText
  // listener attaches AFTER our oninput in that case and already sees the
  // formatted value.
  if ((el as InputWithLastValid)[IS_WRAPPER_KEY]) {
    // bubbles: false — the synth event must only reach listeners attached
    // directly on the inner <input> (the target-phase wrapper handler).
    // Ancestor listeners on the host or its parents are unrelated to the
    // formatting pipeline; bubbling the synth event up would surface a
    // duplicate `input` to userland code outside the wrapper, which they'd
    // have no reason to filter on SYNTH_FLAG.
    const synth: SynthEvent = new Event('input', { bubbles: false });
    synth[SYNTH_FLAG] = true;
    el.dispatchEvent(synth);
  }
};

const onKeyDown = (e: KeyboardEvent, opt: VMoneyOptions | ExtractPropTypes<never>) => {
  const el = e.currentTarget as HTMLInputElement;

  const backspacePressed = e.code === 'Backspace' || e.code === 'Delete';
  const isAtEndPosition = (el.value.length - (el.selectionEnd || 0)) === 0;

  debug(opt, 'directive onkeydown() - el.value', el.value);
  debug(opt, 'directive onkeydown() - backspacePressed', backspacePressed);
  debug(opt, 'directive onkeydown() - isAtEndPosition', isAtEndPosition);

  if (opt.allowBlank
      && opt.treatZeroAsBlank
      && backspacePressed
      && isAtEndPosition
      && parseFloat(String(unformat(el.value, opt, 'directive onkeydown allowBlank'))) === 0
  ) {
    debug(opt, 'directive onkeydown() - set el.value = ""', el.value);
    el.value = '';
    el.dispatchEvent(event('change')); // v-model.lazy
  }

  debug(opt, 'directive onkeydown() - e.key', e.key);
  if (e.key === '+' && el.value.indexOf('-') >= 0) {
    debug(opt, 'directive onkeydown() - flipping sign on el.value', el.value);
    el.value = el.value.replace('-', '');
    setValue(el, opt, 'directive onkeydown +');
  }
};

const onInput = (e: Event, opt: VMoneyOptions | ExtractPropTypes<never>) => {
  if ((e as SynthEvent)[SYNTH_FLAG]) return; // re-entry guard for wrapper re-fire
  const el = e.currentTarget as HTMLInputElement;
  debug(opt, 'directive oninput()', el.value);
  if (/^[1-9]$/.test(el.value)) {
    el.value = numbersToCurrency(el.value, fixed(opt.precision));
    debug(opt, 'directive oninput() - is 1-9', el.value);
  }
  setValue(el, opt, 'directive oninput');
};

const onFocus = (e: Event, opt: VMoneyOptions | ExtractPropTypes<never>) => {
  const el = e.currentTarget as HTMLInputElement;
  debug(opt, 'directive onFocus()', el.value);
  if (opt.focusOnRight) {
    setCursor(el, el.value.length - opt.suffix.length);
  }
};

const getValidatedInputElement = (el: HTMLInputElement): HTMLInputElement => {
  // v-money3 used on a component that's not an input
  if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
    const els = el.getElementsByTagName('input');
    if (els.length !== 1) {
      throw new Error(`v-money3 requires 1 input, found ${els.length} elements.`);
    } else {
      // eslint-disable-next-line prefer-destructuring
      return els[0];
    }
  }
  return el;
};

const registerListeners = (el: HTMLInputElement, opt: VMoneyOptions | ExtractPropTypes<never>) => {
  el.onkeydown = (e: KeyboardEvent) => {
    onKeyDown(e, opt);
  };

  el.oninput = (e: Event) => {
    onInput(e, opt);
  };

  el.onfocus = (e: Event) => {
    onFocus(e, opt);
  };
};

function someFormatKeyChanged(
  oldOpt: VMoneyOptions | ExtractPropTypes<never> | null,
  newOpt: VMoneyOptions | ExtractPropTypes<never>,
): boolean {
  if (!oldOpt) return false;
  return FORMAT_AFFECTING_KEYS.some(
    (k) => JSON.stringify(
      (oldOpt as Record<string, unknown>)[k],
    ) !== JSON.stringify(
      (newOpt as Record<string, unknown>)[k],
    ),
  );
}

// Stash the inner <input> on the host so beforeUnmount() can clear listeners
// on the same node mounted() attached them to, even when the host is a wrapper.
const INNER_INPUT_KEY = '__v_money3_input__';

type HostWithInner = HTMLElement & { [INNER_INPUT_KEY]?: HTMLInputElement };

function resolveInner(host: HTMLInputElement): HTMLInputElement {
  const stashed = (host as HostWithInner)[INNER_INPUT_KEY];
  if (stashed) return stashed;
  const inner = getValidatedInputElement(host);
  (host as HostWithInner)[INNER_INPUT_KEY] = inner;
  return inner;
}

export default {
  mounted(host: HTMLInputElement, binding: DirectiveBinding): void {
    if (!binding.value) {
      return;
    }

    const opt: VMoneyOptions | ExtractPropTypes<never> = filterOptRestrictions({
      ...defaults,
      ...binding.value,
    });

    debug(opt, 'directive mounted() - opt', opt);

    const el = resolveInner(host);
    (el as InputWithLastValid)[IS_WRAPPER_KEY] = host !== el;

    registerListeners(el, opt);

    debug(opt, 'directive mounted() - el.value', el.value);
    setValue(el, opt, 'directive mounted');
  },
  updated(host: HTMLInputElement, binding: DirectiveBinding): void {
    if (!binding.value) {
      return;
    }

    const opt: VMoneyOptions | ExtractPropTypes<never> = filterOptRestrictions({
      ...defaults,
      ...binding.value,
    });

    debug(opt, 'directive updated() - opt', opt);
    debug(opt, 'directive updated() - host.value', (host as HTMLInputElement).value);

    const el = resolveInner(host);
    (el as InputWithLastValid)[IS_WRAPPER_KEY] = host !== el;

    // If the would-be reformat already matches the input, the component layer
    // has already pre-synced the display via its format-prop watcher. No-op.
    const formatted = format(el.value, opt, 'directive updated check');
    if (formatted === el.value) {
      return;
    }

    // Display differs from what current opts would produce. If any
    // format-affecting opt also changed since the previous updated() call,
    // this is the bare-directive corruption case — warn and skip.
    const oldOpt = binding.oldValue
      ? filterOptRestrictions({ ...defaults, ...binding.oldValue })
      : null;
    if (someFormatKeyChanged(oldOpt, opt) && el.value !== '') {
      // eslint-disable-next-line no-console
      console.warn(
        'v-money3: runtime change of format options on the bare directive is '
        + 'unsupported and was skipped to avoid corrupting the value. '
        + 'Re-mount the directive or use the Money3 component instead.',
      );
      return;
    }

    setValue(el, opt, 'directive updated');
  },
  beforeUnmount(host: HTMLInputElement): void {
    const el = (host as HostWithInner)[INNER_INPUT_KEY] || host;
    el.onkeydown = null;
    el.oninput = null;
    el.onfocus = null;
    delete (el as InputWithLastValid)[IS_WRAPPER_KEY];
    delete (host as HostWithInner)[INNER_INPUT_KEY];
  },
};
