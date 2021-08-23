<template>
  <input type="tel"
    :id="id"
    :value="data.formattedValue"
    :disabled="disabled"
    @change="change"
    v-bind="listeners"
    v-money3="{
      precision,
      decimal,
      thousands,
      prefix,
      suffix,
      disableNegative,
      min,
      max,
      allowBlank,
      minimumNumberOfCharacters,
      debug,
      modelModifiers,
    }"
    class="v-money3" />
</template>

<script>
import {
  defineComponent, reactive, watch, computed,
} from 'vue';
import Money3Directive from './directive';
import defaults from './options';
import Utils from './Utils';
import format from './format';
import unformat from './unformat';

export default defineComponent({
  inheritAttrs: false,
  name: 'Money3',
  props: {
    debug: {
      required: false,
      type: Boolean,
      default: false,
    },
    id: {
      required: false,
      type: [Number, String],
      default: 0,
    },
    modelValue: {
      required: false,
      type: [Number, String, undefined, null],
      default: null,
    },
    modelModifiers: {
      required: false,
      type: Object,
      default: () => ({ number: false }),
    },
    masked: {
      type: Boolean,
      default: false,
    },
    precision: {
      type: Number,
      default: () => defaults.precision,
    },
    decimal: {
      type: String,
      default: () => defaults.decimal,
      validator(value) {
        return Utils.validateRestrictedInput(value, 'decimal');
      },
    },
    thousands: {
      type: String,
      default: () => defaults.thousands,
      validator(value) {
        return Utils.validateRestrictedInput(value, 'thousands');
      },
    },
    prefix: {
      type: String,
      default: () => defaults.prefix,
      validator(value) {
        return Utils.validateRestrictedInput(value, 'prefix');
      },
    },
    suffix: {
      type: String,
      default: () => defaults.suffix,
      validator(value) {
        return Utils.validateRestrictedInput(value, 'suffix');
      },
    },
    disableNegative: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    max: {
      type: [String, Number],
      default: () => defaults.max,
    },
    min: {
      type: [String, Number],
      default: () => defaults.min,
    },
    allowBlank: {
      type: Boolean,
      default: () => defaults.allowBlank,
    },
    minimumNumberOfCharacters: {
      type: Number,
      default: () => defaults.minimumNumberOfCharacters,
    },
  },

  directives: { money3: Money3Directive },

  setup(props, { emit, attrs }) {
    if (props.debug) console.log('component setup()', props);

    const modelValue = props.modelModifiers && props.modelModifiers.number
      ? Number(props.modelValue).toFixed(Utils.fixed(props.precision))
      : props.modelValue;

    const data = reactive({
      formattedValue: format(modelValue, props, 'component setup'),
      props: Utils.filterOptRestrictions({ ...props }),
    });

    if (props.debug) console.log('component setup() - data.formattedValue', data.formattedValue);

    watch(
      () => props.modelValue, (val) => {
        if (props.debug) console.log('component watch() -> val', val);
        const formatted = format(val, data.props, 'component watch');
        if (formatted !== data.formattedValue) {
          if (props.debug) console.log('component watch() changed -> formatted', formatted);
          data.formattedValue = formatted;
        }
      },
    );

    let lastValue = null;
    function change(evt) {
      if (props.debug) console.log('component change() -> evt.target.value', evt.target.value);
      const value = props.masked && !props.modelModifiers.number ? evt.target.value : unformat(evt.target.value, data.props, 'component change');
      if (value !== lastValue) {
        lastValue = value;
        if (props.debug) console.log('component change() -> update:model-value', value);
        emit('update:model-value', value);
      }
    }

    const listeners = computed(() => {
      const payload = {
        ...attrs,
      };

      delete payload['onUpdate:modelValue'];

      return payload;
    });

    return {
      data,
      listeners,
      change,
    };
  },
});
</script>
