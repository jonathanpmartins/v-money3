import Utils from './Utils';
import format from './format';
import unformat from './unformat';
import assign from './assign';
import defaults from './options';

let opt = null;

const setValue = (el, caller) => {
  if (opt.debug) console.log('directive setValue() - caller', caller);

  if (!Utils.validateRestrictedOptions(opt)) {
    if (opt.debug) console.log('directive setValue() - validateRestrictedOptions() return false. Stopping here...', el.value);
    return;
  }

  let positionFromEnd = el.value.length - el.selectionEnd;

  el.value = format(el.value, opt, caller);

  positionFromEnd = Math.max(positionFromEnd, opt.suffix.length); // right
  positionFromEnd = el.value.length - positionFromEnd;
  positionFromEnd = Math.max(positionFromEnd, opt.prefix.length); // left

  Utils.setCursor(el, positionFromEnd);

  el.dispatchEvent(Utils.event('change')); // v-model.lazy
};

export default {
  mounted(el, binding) {
    if (!binding.value) {
      return;
    }

    opt = assign(defaults, binding.value);

    if (opt.debug) console.log('directive mounted() - opt', opt);

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
      const isAtEndPosition = (el.value.length - el.selectionEnd) === 0;

      if (opt.debug) console.log('directive onkeydown() - el.value', el.value);
      if (opt.debug) console.log('directive onkeydown() - backspacePressed', backspacePressed);
      if (opt.debug) console.log('directive onkeydown() - isAtEndPosition', isAtEndPosition);

      if (opt.allowBlank
          && backspacePressed
          && isAtEndPosition
          && unformat(el.value, opt) === 0
      ) {
        if (opt.debug) console.log('directive onkeydown() - set el.value = ""', el.value);
        el.value = '';
        el.dispatchEvent(Utils.event('change')); // v-model.lazy
      }

      if (opt.debug) console.log('directive onkeydown() - e.key', e.key);
      if (e.key === '+') {
        if (opt.debug) console.log('directive onkeydown() - unformat el.value', el.value);
        const number = unformat(el.value, opt);
        if (number < 0) {
          el.value = number * -1;
        }
      }
    };

    el.oninput = () => {
      if (opt.debug) console.log('directive oninput()', el.value);
      if (opt.debug) console.log('directive oninput() !opt.modelModifiers || !opt.modelModifiers.number', !opt.modelModifiers || !opt.modelModifiers.number);
      if (!opt.modelModifiers || !opt.modelModifiers.number) {
        if (/^[1-9]$/.test(el.value)) {
          el.value = Utils.numbersToCurrency(el.value, Utils.fixed(opt.precision));
          if (opt.debug) console.log('directive oninput() - is 1-9', el.value);
        }
      }
      setValue(el, 'directive oninput');
    };

    if (opt.debug) console.log('directive mounted() - el.value', el.value);
    setValue(el, 'directive mounted');
  },
  updated(el, binding) {
    if (!binding.value) {
      return;
    }
    opt = assign(defaults, binding.value);
    if (opt.debug) console.log('directive updated() - el.value', el.value);
    if (opt.debug) console.log('directive updated() - opt', opt);
    setValue(el, 'directive updated');
  },
  beforeUnmount(el) {
    el.onkeydown = null;
    el.oninput = null;
    el.onfocus = null;
  },
};
