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
      shouldRound
    }"
    class="v-money3" />
</template>

<script lang="ts">
import money3 from './directive.ts';

export default {
  inheritAttrs: false,
  name: 'Money3',
  directives: {
    money3
  }
};
</script>

<script lang="ts" setup>
import { computed, getCurrentInstance, reactive, toRefs, useAttrs, watch } from 'vue';
import defaults from './options';
import format from './format';
import unformat from './unformat';
import { Debug, filterOptRestrictions, fixed, validateRestrictedInput } from './Utils';

const props = defineProps({
  debug: {
    required: false,
    type: Boolean,
    default: false,
  },
  id: {
    required: false,
    type: [Number, String],
    default: () => getCurrentInstance().uid,
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
      return validateRestrictedInput(value, 'decimal');
    },
  },
  thousands: {
    type: String,
    default: () => defaults.thousands,
    validator(value) {
      return validateRestrictedInput(value, 'thousands');
    },
  },
  prefix: {
    type: String,
    default: () => defaults.prefix,
    validator(value) {
      return validateRestrictedInput(value, 'prefix');
    },
  },
  suffix: {
    type: String,
    default: () => defaults.suffix,
    validator(value) {
      return validateRestrictedInput(value, 'suffix');
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
  shouldRound: {
    type: Boolean,
    default: () => defaults.shouldRound
  }
});

const {
  debug,
  id,
  modelModifiers,
  masked,
  precision,
  decimal,
  thousands,
  prefix,
  suffix,
  disableNegative,
  disabled,
  max,
  min,
  allowBlank,
  minimumNumberOfCharacters,
  shouldRound
} = toRefs(props);

Debug(props,'component setup()', props);

const modelValue = modelModifiers.value && modelModifiers.value.number
  ? (
    shouldRound.value
      ? Number(props.modelValue).toFixed(fixed(precision.value))
      : Number(props.modelValue).toFixed(fixed(precision.value) + 1).slice(0, -1)
  )
  : props.modelValue;

const data = reactive({
  formattedValue: format(modelValue, props, 'component setup'),
});

Debug(props,'component setup() - data.formattedValue', data.formattedValue);

watch(
  () => props.modelValue, (val) => {
    Debug(props,'component watch() -> val', val);
    const formatted = format(val, filterOptRestrictions({ ...props }), 'component watch');
    if (formatted !== data.formattedValue) {
      Debug(props,'component watch() changed -> formatted', formatted);
      data.formattedValue = formatted;
    }
  },
);

let lastValue = null;
const emit = defineEmits<{(e: 'update:model-value', value: string | number): void}>();
function change(evt) {
  Debug(props,'component change() -> evt.target.value', evt.target.value);
  const value = masked.value && !modelModifiers.value.number ? evt.target.value : unformat(evt.target.value, filterOptRestrictions({ ...props }), 'component change');
  if (value !== lastValue) {
    lastValue = value;
    Debug(props,'component change() -> update:model-value', value);
    emit('update:model-value', value);
  }
}

const attrs = useAttrs();
const listeners = computed(() => {
  const payload = {
    ...attrs,
  };

  delete payload['onUpdate:modelValue'];

  return payload;
});
</script>
