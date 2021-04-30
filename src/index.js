import Money3Component from './component.vue'
import Money3Directive from './directive'

export {
  Money3Component,
  Money3Directive,
}

export default {
  install: (app) => {
    app.component('money3', Money3Component)
    app.directive('money3', Money3Directive)
  }
}
