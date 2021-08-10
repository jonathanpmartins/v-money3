<template>
  <div>
    <h3>Component</h3>
    <v-money3-component
        id="component"
        v-bind="config"
        v-model.number="componentAmount"
    />
    <div>
      <div>
        model: [{{ componentAmount }}]
      </div>
      <div>
        typeof: [{{ typeof componentAmount }}]
      </div>
    </div>
    <hr>
    <h3>Directive</h3>
    <input
        id="directive"
        v-money3-directive="config"
        v-model.lazy="directiveAmount"
        type="tel">
    <div>
      <div>
        model: [{{ directiveAmount }}]
      </div>
      <div>
        typeof: [{{ typeof directiveAmount }}]
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref, reactive,
} from 'vue';
import VMoney3Component from '../../src/component.vue';
// eslint-disable-next-line import/no-named-default
import { default as vMoney3Directive } from '../../src/directive';

function get(key, value) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return params.get(key) === 'empty' ? '' : params.get(key) || value;
}

const componentAmount = ref(get('componentAmount', 0));
const directiveAmount = ref(get('directiveAmount', 0));
const config = reactive({
  debug: true,
  // masked: false,
  prefix: get('prefix', ''),
  suffix: get('suffix', ''),
  thousands: get('thousands', ','),
  decimal: get('decimal', '.'),
  precision: Number(get('precision', 2)),
  disableNegative: !!get('disableNegative', false),
  disabled: !!get('disabled', false),
  min: Number(get('min', Number.MIN_SAFE_INTEGER)),
  max: Number(get('max', Number.MAX_SAFE_INTEGER)),
  allowBlank: !!get('allowBlank', false),
  minimumNumberOfCharacters: get('minimumNumberOfCharacters', 0),
});

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
