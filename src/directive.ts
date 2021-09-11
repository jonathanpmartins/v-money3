import {
  Debug,
  filterOptRestrictions,
  fixed,
  numbersToCurrency,
  setCursor,
  validateRestrictedOptions,
  event
} from './Utils';
import format from './format';
import unformat from './unformat';
import defaults, { VMoneyOptions } from './options';
import { DirectiveBinding } from 'vue';

// TODO this option is used for ALL directive instances
let opt: VMoneyOptions|null = null;

const setValue = (el: HTMLInputElement, caller: any) => {
  Debug(opt!, 'directive setValue() - caller', caller);

  if (!validateRestrictedOptions(opt!)) {
    Debug(opt!, 'directive setValue() - validateRestrictedOptions() return false. Stopping here...', el.value);
    return;
  }

  let positionFromEnd = el.value.length - el.selectionEnd!;

  el.value = format(el.value, opt!, caller);

  positionFromEnd = Math.max(positionFromEnd, opt!.suffix.length); // right
  positionFromEnd = el.value.length - positionFromEnd;
  positionFromEnd = Math.max(positionFromEnd, opt!.prefix.length); // left

  setCursor(el, positionFromEnd);

  el.dispatchEvent(event('change')); // v-model.lazy
};

export default {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    if (!binding.value) {
      return;
    }

    opt = filterOptRestrictions({ ...defaults, ...binding.value });

    Debug(opt, 'directive mounted() - opt', opt);

    // v-money3 used on a component that's not a input
    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      const els = el.getElementsByTagName('input');
      if (els.length !== 1) {
        // throw new Error("v-money3 requires 1 input, found " + els.length)
      } else {
        // eslint-disable-next-line prefer-destructuring
        el = els[0];
      }
    }

    el.onkeydown = (e) => {
      const backspacePressed = e.code === 'Backspace' || e.code === 'Delete';
      const isAtEndPosition = (el.value.length - el.selectionEnd!) === 0;

      Debug(opt!, 'directive onkeydown() - el.value', el.value);
      Debug(opt!, 'directive onkeydown() - backspacePressed', backspacePressed);
      Debug(opt!, 'directive onkeydown() - isAtEndPosition', isAtEndPosition);

      if (opt!.allowBlank
          && backspacePressed
          && isAtEndPosition
          && unformat(el.value, opt!) === 0
      ) {
        Debug(opt!, 'directive onkeydown() - set el.value = ""', el.value);
        el.value = '';
        el.dispatchEvent(event('change')); // v-model.lazy
      }

      Debug(opt!, 'directive onkeydown() - e.key', e.key);
      if (e.key === '+') {
        Debug(opt!, 'directive onkeydown() - unformat el.value', el.value);
        let number = unformat(el.value, opt!);
        if (typeof number === 'string') {
          number = parseFloat(number);
        }
        if (number < 0) {
          el.value = String(number * -1);
        }
      }
    };

    el.oninput = () => {
      Debug(opt!, 'directive oninput()', el.value);
      if (/^[1-9]$/.test(el.value)) {
        el.value = numbersToCurrency(el.value, fixed(opt!.precision));
        Debug(opt!, 'directive oninput() - is 1-9', el.value);
      }
      setValue(el, 'directive oninput');
    };

    Debug(opt, 'directive mounted() - el.value', el.value);
    setValue(el, 'directive mounted');
  },
  updated(el: HTMLInputElement, binding: DirectiveBinding) {
    if (!binding.value) {
      return;
    }
    opt = filterOptRestrictions({ ...defaults, ...binding.value });
    Debug(opt, 'directive updated() - el.value', el.value);
    Debug(opt, 'directive updated() - opt', opt);
    setValue(el, 'directive updated');
  },
  beforeUnmount(el: HTMLInputElement) {
    el.onkeydown = null;
    el.oninput = null;
    el.onfocus = null;
  },
};
