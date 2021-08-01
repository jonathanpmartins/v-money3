<template>
  <div>
    <v-money3
        id="component"
        v-bind="config"
        @update:model-value="updateValue"
        :model-value="amount"
    />
  </div>
</template>

<script setup>
import { ref, reactive, defineEmit } from 'vue';
import VMoney3 from '../../src/component.vue';

const url = new URL(window.location.href);
const params = url.searchParams;// .get('amount')

function get(key, value) {
  return params.get(key) || value;
}

const amount = ref(get('amount', 0));
const config = reactive({
  // debug: false,
  // masked: false,
  // prefix: 'R$ ',
  // suffix: '',
  // thousands: '.',
  // decimal: ',',
  // precision: 2,
  // disableNegative: false,
  // disabled: false,
  // min: Number.MIN_SAFE_INTEGER,
  // max: Number.MAX_SAFE_INTEGER,
  // allowBlank: false,
  // minimumNumberOfCharacters: 0,
});

const emit = defineEmit(['update:modelValue']);

const updateValue = (value) => {
  amount.value = value;
};

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
