<template>
  <ul>
    <li v-for="(config, $index) in configs" :key="$index">
      <h3>Component</h3>
      <v-money3-component
          v-if="config.modelModifiers && config.modelModifiers.number"
          :id="'component-'+$index"
          v-bind="config"
          v-model.number="config.modelValue"
      />
      <v-money3-component
          v-else
          :id="'component-'+$index"
          v-bind="config"
          v-model="config.modelValue"
      />
      <div>
        model: [{{ config.modelValue }}]
      </div>
      <div>
        typeof: [{{ typeof config.modelValue }}]
      </div>
    </li>
  </ul>
</template>

<script setup>
import {
  ref, reactive,
} from 'vue';
import VMoney3Component from '../../src/component.vue';

function get(key, value) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return params.get(key) === 'empty' ? '' : params.get(key) || value;
}

const configs = reactive([]);

let payload = JSON.parse(get('payload', false));
console.log("payload", payload);
if (payload && payload.length) {
  for (let i = 0; i < payload.length; i += 1) {
    configs.push(payload[i]);
  }
} else {
  configs.push({
    modelValue: ref(get('modelValue', 0)),
    debug: !!get('debug', false),
    masked: false,
    prefix: get('prefix', ''),
    suffix: get('suffix', ''),
    thousands: get('thousands', ','),
    decimal: get('decimal', '.'),
    precision: Number(get('precision', 2)),
    disableNegative: !!get('disableNegative', false),
    disabled: !!get('disabled', false),
    min: get('min', `${Number.MIN_SAFE_INTEGER}`),
    max: get('max', `${Number.MAX_SAFE_INTEGER}`),
    allowBlank: !!get('allowBlank', false),
    minimumNumberOfCharacters: get('minimumNumberOfCharacters', 0),
    modelModifiers: {
      number: ref(!!get('useModelNumberModifier', false)),
    },
    shouldRound: get('shouldRound') !== 'false',
    focusOnRight: get('focusOnRight') === 'true',
  });
}

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
ul {
  list-style-type: none;
}
</style>
