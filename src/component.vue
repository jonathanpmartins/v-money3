<template>
  <input type="tel"
    :id="id"
    :value="data.formattedValue"
    @change="change"
    v-money3="{precision, decimal, thousands, prefix, suffix}"
    class="v-money3" />
</template>

<script>
import { defineComponent, reactive, watch } from 'vue'
import money3 from './directive'
import defaults from './options'
import {format, unformat} from './utils'

export default defineComponent({
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
    }
  },

  directives: { money3 },

  setup(props, { emit }) {

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

    function change(evt) {
      emit('update:model-value', props.masked ? evt.target.value : unformat(evt.target.value, props))
    }

    return {
      data,
      change
    }
  },
})
</script>
