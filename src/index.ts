import { App } from 'vue';
import Money3Component from './component.vue';
import Money3Directive from './directive';
import format from './format';
// eslint-disable-next-line import/named
import { VMoneyOptions } from './options';
import unformat from './unformat';

export default {
  install(app: App): void {
    app.component('money3', Money3Component);
    app.directive('money3', Money3Directive);
  },
};

export type {
  VMoneyOptions,
};

export {
  Money3Component,
  Money3Directive,
  format,
  unformat,
  // backwards compatibility
  Money3Component as Money3,
  Money3Directive as VMoney3,
  Money3Component as Money,
  Money3Directive as VMoney,
};
