<template>
  <input
    :id="`${id}`"
    v-bind="listeners"
    v-money3="{
      precision,
      decimal: props.decimal,
      thousands: props.thousands,
      prefix: props.prefix,
      suffix: props.suffix,
      disableNegative: props.disableNegative,
      min: props.min,
      max: props.max,
      allowBlank: props.allowBlank,
      minimumNumberOfCharacters: props.minimumNumberOfCharacters,
      debug: props.debug,
      modelModifiers,
      shouldRound,
    }"
    type="tel"
    class="v-money3"
    :value="formattedValue"
    :disabled="props.disabled"
    @change="change"
  />
</template>

<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  ref,
  toRefs,
  useAttrs,
  watch,
} from 'vue';
import defaults from './options';
import format from './format';
import unformat from './unformat';
import {
  debug,
  filterOptRestrictions,
  fixed,
  validateRestrictedInput,
} from './Utils';

const props = defineProps({
  debug: {
    required: false,
    type: Boolean,
    default: false,
  },
  id: {
    required: false,
    type: [Number, String],
    default: () => {
      const instante = getCurrentInstance();
      if (instante) {
        return instante.uid;
      }
      return null;
    },
  },
  modelValue: {
    required: true,
    type: [Number, String],
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
    validator(value: string) {
      return validateRestrictedInput(value, 'decimal');
    },
  },
  thousands: {
    type: String,
    default: () => defaults.thousands,
    validator(value: string) {
      return validateRestrictedInput(value, 'thousands');
    },
  },
  prefix: {
    type: String,
    default: () => defaults.prefix,
    validator(value: string) {
      return validateRestrictedInput(value, 'prefix');
    },
  },
  suffix: {
    type: String,
    default: () => defaults.suffix,
    validator(value: string) {
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
    type: [Number, String],
    default: () => defaults.max,
  },
  min: {
    type: [Number, String],
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
    default: () => defaults.shouldRound,
  },
});

const { modelValue, modelModifiers, masked, precision, shouldRound } =
  toRefs(props);

debug(props, 'component setup()', props);

let value: string | number = modelValue.value;
if (props.disableNegative || value !== '-') {
  if (modelModifiers.value && modelModifiers.value.number) {
    if (shouldRound.value) {
      value = Number(modelValue.value).toFixed(fixed(precision.value));
    } else {
      value = Number(modelValue.value)
          .toFixed(fixed(precision.value) + 1)
          .slice(0, -1);
    }
  }
}
const formattedValue = ref(format(value, props, 'component setup'));

debug(props, 'component setup() - data.formattedValue', formattedValue.value);

watch(modelValue, modelValueWatcher);
function modelValueWatcher(value: string | number | null | undefined): void {
  debug(props, 'component watch() -> value', value);
  const formatted = format(
    value,
    filterOptRestrictions({ ...props }),
    'component watch',
  );
  if (formatted !== formattedValue.value) {
    debug(props, 'component watch() changed -> formatted', formatted);
    formattedValue.value = formatted;
  }
}

let lastValue: string | number | null = null;
const emit =
  defineEmits<{ (e: 'update:model-value', value: string | number): void }>();

function change(evt: Event) {
  let value: string | number = (evt.target as HTMLInputElement).value;

  debug(props, 'component change() -> evt.target.value', value);

  if (!(masked.value && !modelModifiers.value.number)) {
    value = unformat(
        value,
        filterOptRestrictions({ ...props }),
        'component change',
    );
  }
  if (value !== lastValue) {
    lastValue = value;
    debug(props, 'component change() -> update:model-value', value);
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

<script lang="ts">
import money3 from './directive';
export default {
  inheritAttrs: false,
  name: 'Money3',
  directives: {
    money3,
  },
};
</script>
