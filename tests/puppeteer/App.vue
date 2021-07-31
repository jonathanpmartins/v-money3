<template>
  <div>
    <v-money3
        v-bind="config"
        @update:model-value="updateValue"
        :model-value="amount"
    />
<!--    <input type="button" @click="test"/>-->
  </div>
</template>

<script setup>
import { ref, reactive, defineEmit } from 'vue';
import VMoney3 from '../../src/component.vue';

const amount = ref(1.11);
const config = reactive({
  debug: true,
  masked: false,
  prefix: 'R$ ',
  suffix: '',
  thousands: '.',
  decimal: ',',
  precision: 2,
});

const emit = defineEmit(['update:modelValue']);

const updateValue = (value) => {
  amount.value = value;
  console.log('amount.value', amount.value);
  console.log('amount', amount);
  console.log('tested!', value);
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
