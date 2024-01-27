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

// this option is used for ALL directive instances
// let opt: VMoneyOptions = defaults;

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

  if (formatted === el.value) return; // prevent unnecessary updates

  el.value = formatted;

  positionFromEnd = Math.max(positionFromEnd, opt.suffix.length); // right
  positionFromEnd = el.value.length - positionFromEnd;
  positionFromEnd = Math.max(positionFromEnd, opt.prefix.length); // left

  setCursor(el, positionFromEnd);

  el.dispatchEvent(event('change')); // v-model.lazy or not
};

const onKeyDown = (e: KeyboardEvent, opt: VMoneyOptions | ExtractPropTypes<never>) => {
  const el = e.currentTarget as HTMLInputElement;

  const backspacePressed = e.code === 'Backspace' || e.code === 'Delete';
  const isAtEndPosition = (el.value.length - (el.selectionEnd || 0)) === 0;

  debug(opt, 'directive onkeydown() - el.value', el.value);
  debug(opt, 'directive onkeydown() - backspacePressed', backspacePressed);
  debug(opt, 'directive onkeydown() - isAtEndPosition', isAtEndPosition);

  if (opt.allowBlank
      && backspacePressed
      && isAtEndPosition
      && unformat(el.value, opt, 'directive onkeydown allowBlank') === 0
  ) {
    debug(opt, 'directive onkeydown() - set el.value = ""', el.value);
    el.value = '';
    el.dispatchEvent(event('change')); // v-model.lazy
  }

  debug(opt, 'directive onkeydown() - e.key', e.key);
  if (e.key === '+') {
    debug(opt, 'directive onkeydown() - unformat el.value', el.value);
    let number = unformat(el.value, opt, 'directive onkeydown +');
    if (typeof number === 'string') {
      number = parseFloat(number);
    }
    if (number < 0) {
      el.value = String(number * -1);
    }
  }
};

const onInput = (e: Event, opt: VMoneyOptions | ExtractPropTypes<never>) => {
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

export default {
  mounted(el: HTMLInputElement, binding: DirectiveBinding): void {
    if (!binding.value) {
      return;
    }

    const opt: VMoneyOptions | ExtractPropTypes<never> = filterOptRestrictions({
      ...defaults,
      ...binding.value,
    });

    debug(opt, 'directive mounted() - opt', opt);

    el = getValidatedInputElement(el);

    registerListeners(el, opt);

    debug(opt, 'directive mounted() - el.value', el.value);
    setValue(el, opt, 'directive mounted');
  },
  updated(el: HTMLInputElement, binding: DirectiveBinding): void {
    if (!binding.value) {
      return;
    }

    const opt = filterOptRestrictions({
      ...defaults,
      ...binding.value,
    });

    debug(opt, 'directive updated() - opt', opt);
    debug(opt, 'directive updated() - el.value', el.value);
    setValue(el, opt, 'directive updated');
  },
  beforeUnmount(el: HTMLInputElement): void {
    el.onkeydown = null;
    el.oninput = null;
    el.onfocus = null;
  },
};
