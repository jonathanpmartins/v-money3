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
    }"
    class="v-money3" />
</template>

<script>
import {
  defineComponent, reactive, watch, computed,
} from 'vue';
import Money3Directive from './directive';
import defaults from './options';
import { format, unformat } from './utils';

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
    },
    thousands: {
      type: String,
      default: () => defaults.thousands,
    },
    prefix: {
      type: String,
      default: () => defaults.prefix,
    },
    suffix: {
      type: String,
      default: () => defaults.suffix,
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
      type: Number,
      default: () => defaults.max,
    },
    min: {
      type: Number,
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
    const data = reactive({
      formattedValue: format(props.modelValue, props, 'setup'),
    });

    watch(
      () => props.modelValue, (val) => {
        const formatted = format(val, props, 'watch');
        if (formatted !== data.formattedValue) {
          data.formattedValue = formatted;
        }
      },
    );

    function change(evt) {
      const value = props.masked ? evt.target.value : unformat(evt.target.value, props, 'change');
      emit('update:model-value', value);
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
