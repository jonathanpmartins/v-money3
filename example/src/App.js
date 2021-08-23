export default {
  name: 'App',
  data() {
    return {
      componentAmount: '1234.50',
      directiveAmount: '6543.21',
      config: {
        decimal: ',',
        thousands: '.',
        prefix: 'R$ ',
        suffix: ' #',
        precision: 2,
        masked: false, /* doesn't work with directive */
        disableNegative: false,
        disabled: false,
        min: null,
        max: null,
        allowBlank: false,
        minimumNumberOfCharacters: 0,
        debug: true,
      },
    };
  },
  template: `
      <div>
      <section class="hero is-small is-success">
        <div class="hero-body">
          <h1 class="title">
            Hello v-money3
          </h1>
          <p class="subtitle">
            Money Mask for <strong>Vue 3</strong>!
          </p>
          <a href="https://jonathanpmartins.github.io/v-money3/" class="button">Docs</a>
<!--          <figure class="image is-128x128">-->
<!--            <img class="is-rounded" src="https://cdn-images-1.medium.com/max/600/1*Rpc289FpghuHrnzyVpOUig.gif" alt="v-money3"/>-->
<!--          </figure>-->
        </div>
      </section>
      <section class="section">
        <div class="container">
          <form>
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label">Component</label>
                  <div class="control">
                    <money3 v-model="componentAmount" v-bind="config" class="input" />
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Component Model</label>
                  <div class="control">
                    <input v-model="componentAmount" class="input" type="text" disabled>
                  </div>
                </div>
              </div>
<!--              <div class="column">-->
<!--                <div class="field">-->
<!--                  <label class="label">Directive</label>-->
<!--                  <div class="control">-->
<!--                    <input v-model.lazy="directiveAmount" v-money3="config" class="input" type="tel">-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>              -->
<!--              <div class="column">-->
<!--                <div class="field">-->
<!--                  <label class="label">Directive Model</label>-->
<!--                  <div class="control">-->
<!--                    <input v-model.lazy="directiveAmount" class="input" type="text" disabled>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
            </div>
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label">Prefix</label>
                  <div class="control">
                    <input v-model="config.prefix" class="input" type="text">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Suffix</label>
                  <div class="control">
                    <input v-model="config.suffix" class="input" type="text">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Thousands</label>
                  <div class="control">
                    <input v-model="config.thousands" class="input" type="text">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Decimal</label>
                  <div class="control">
                    <input v-model="config.decimal" class="input" type="text">
                  </div>
                </div>
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label">Precision</label>
                  <div class="control">
                    <input v-model="config.precision" class="input" type="number" min="0" max="20">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Minimum Allowed Value</label>
                  <div class="control">
                    <input v-model="config.min" class="input">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Maximum Allowed Value</label>
                  <div class="control">
                    <input v-model="config.max" class="input">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Min. Number Of Characters</label>
                  <div class="control">
                    <input v-model="config.minimumNumberOfCharacters" class="input" type="number">
                  </div>
                </div>
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label">Disable Negative Values</label>
                  <div class="control">
                    <input v-model="config.disableNegative" type="checkbox">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Disable <small>(only component)</small></label>
                  <div class="control">
                    <input v-model="config.disabled" type="checkbox">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Allow Blank Values</label>
                  <div class="control">
                    <input v-model="config.allowBlank" type="checkbox">
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Masked? <small>(only component)</small></label>
                  <div class="control">
                    <input v-model="config.masked" type="checkbox">
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      </div>
  `,
};
