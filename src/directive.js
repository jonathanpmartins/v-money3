import {format, unformat, setCursor, event, fixed, numbersToCurrency} from './utils'
import assign from './assign'
import defaults from './options'

let lastKnownValue = null;

const setValue = (el, opt, caller) => {
  if (lastKnownValue === el.value) {
    return;
  }
  let positionFromEnd = el.value.length - el.selectionEnd
  el.value = format(el.value, opt, caller)
  lastKnownValue = el.value;
  positionFromEnd = Math.max(positionFromEnd, opt.suffix.length) // right
  positionFromEnd = el.value.length - positionFromEnd
  positionFromEnd = Math.max(positionFromEnd, opt.prefix.length) // left
  setCursor(el, positionFromEnd)
  el.dispatchEvent(event('change')) // v-model.lazy
}

export default {
  mounted(el, binding) {

    if (!binding.value) {
      return
    }

    const opt = assign(defaults, binding.value)

    // v-money3 used on a component that's not a input
    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      const els = el.getElementsByTagName('input')
      if (els.length !== 1) {
        // throw new Error("v-money3 requires 1 input, found " + els.length)
      } else {
        el = els[0]
      }
    }

    el.onkeydown = function (e) {
      const backspacePressed = e.code === 'Backspace' || e.code === 'Delete'
      const isAtEndPosition = (el.value.length - el.selectionEnd) === 0
      if (opt.allowBlank && backspacePressed && isAtEndPosition && (unformat(el.value, 0) === 0)) {
        el.value = ''
        el.dispatchEvent(event('change')) // v-model.lazy
      }
    }

    el.oninput = function () {
      if (/^[1-9]$/.test(el.value)) {
        el.value = numbersToCurrency(el.value, fixed(opt.precision));
      }
      setValue(el, opt, 'oninput');
    }

    setValue(el, opt, 'mounted');
  },
  updated(el, binding) {
    if (!binding.value) {
      return
    }
    const opt = assign(defaults, binding.value)
    setValue(el, opt, 'mounted');
  },
  beforeUnmount(el) {
    el.onkeydown = null;
    el.oninput = null;
    el.onfocus = null;
  }
}
