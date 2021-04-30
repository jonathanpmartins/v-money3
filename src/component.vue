<template>
  <input type="tel"
    :id="id"
    :value="data.formattedValue"
    v-bind="listeners"
    v-money3="{precision, decimal, thousands, prefix, suffix, disableNegative, min, max}"
    class="v-money3" />
</template>

<script>
import { defineComponent, reactive, watch, computed } from 'vue'
import money3 from './directive'
import defaults from './options'
import {format, unformat} from './utils'

export default defineComponent({
  inheritAttrs: false,
  name: 'Money3',
  props: {
    id: {
      required: false,
      type: [Number, String],
      default: 0
    },
    modelValue: {
      required: true,
      type: [Number, String, undefined],
      default: undefined
    },
    masked: {
      type: Boolean,
      default: false
    },
    precision: {
      type: Number,
      default: () => defaults.precision
    },
    decimal: {
      type: String,
      default: () => defaults.decimal
    },
    thousands: {
      type: String,
      default: () => defaults.thousands
    },
    prefix: {
      type: String,
      default: () => defaults.prefix
    },
    suffix: {
      type: String,
      default: () => defaults.suffix
    },
    disableNegative: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: () => defaults.max
    },
    min: {
      type: Number,
      default: () => defaults.min
    },
  },

  directives: { money3 },

  setup(props, { emit, attrs }) {

    const data = reactive({
      formattedValue: ''
    });

    watch(
        () => props.modelValue,
        (newValue) => {
          const formatted = format(newValue, props)
          if (formatted !== data.formattedValue) {
            data.formattedValue = formatted
          }
        }
    )

    const listeners = computed(() => {
      return {
        ...attrs,
        change: (evt) => {
          emit('update:model-value', props.masked ? evt.target.value : unformat(evt.target.value, props))
        }
      }
    })

    return {
      data,
      listeners,
    }
  },
})
</script>
