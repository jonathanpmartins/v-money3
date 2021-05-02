# Money Mask for Vue 3

![The Mask Money](https://cdn-images-1.medium.com/max/600/1*Rpc289FpghuHrnzyVpOUig.gif)

## Disclaimer

The old [`v-money`](https://github.com/vuejs-tips/v-money) library seems to be abandoned! Since I use it in many projects and part of then will be upgraded to Vue3, I needed it to work after the upgrades.

Feel free to open an issue or post a pull request!

## Features

- Lightweight (<2KB gzipped)
- Dependency free
- Mobile support
- Component or Directive flavors
- Accept copy/paste
- Editable
- Min / Max Limits

## Usage

### Installation

```bash
npm i v-money3 --save
```


### Register Globally ([view codesandbox](https://codesandbox.io/s/v-money3-global-registering-lv1jv?file=/src/main.js))

```js
import { createApp } from "vue";
import money from 'v-money3'

const app = createApp({/* options */})

// register directive v-money3 and component <money3>
app.use(money)
```

### Only Global Component ([view codesandbox](https://codesandbox.io/s/v-money3-global-registering-only-component-dibmu?file=/src/main.js))

```js
import { createApp } from "vue";
import { Money3Component } from 'v-money3'

const app = createApp({/* options */})

// register component <money3>
app.component("money3", Money3Component)
```

### Only Global Directive ([view codesandbox](https://codesandbox.io/s/v-money3-global-registering-only-directive-3n638?file=/src/main.js))

```js
import { createApp } from "vue";
import { Money3Directive } from 'v-money3'

const app = createApp({/* options */})

// register directive v-money3
app.directive('money3', Money3Directive)
```

### Use as component ([view codesandbox](https://codesandbox.io/s/v-money3-use-as-component-oqdc6?file=/src/App.vue))

```html
<template>
  <money3 v-model="amount" v-bind="config"></money3> {{ amount }}
</template>

<script>
  import { Money3Component } from 'v-money3'

  export default {
    components: { money3: Money3Component },
    data () {
      return {
        amount: 123.45,
        config: {
          decimal: ',',
          thousands: '.',
          prefix: 'R$ ',
          suffix: ' #',
          precision: 2,
          masked: false,
          disableNegative: false,
          disabled: false,
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
          allowBlank: false,
        }
      }
    }
  }
</script>
```

### Use as directive ([view codesandbox](https://codesandbox.io/s/v-money3-use-as-directive-e7ror?file=/src/App.vue))
Must use `v-model.lazy` to bind works properly.
```html
<template>
  <input v-model.lazy="amount" v-money3="config" /> {{ amount }}
</template>

<script>
  import { Money3Directive } from 'v-money3'

  export default {
    data () {
      return {
        amount: 123.45,
        config: {
          decimal: ',',
          thousands: '.',
          prefix: 'R$ ',
          suffix: ' #',
          precision: 2,
          masked: false /* doesn't work with directive */,
          disableNegative: false,
          disabled: false,
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
          allowBlank: false,
        }
      }
    },
    directives: { money3: Money3Directive }
  }
</script>
```

## Properties

| property  | Required | Type    | Default | Description                                             |
|-----------|----------|---------|---------|---------------------------------------------------------|
| precision | **true** | Number  | 2       | How many decimal places                                 |
| decimal   | false    | String  | "."     | Decimal separator                                       |
| thousands | false    | String  | ","     | Thousands separator                                     |
| prefix    | false    | String  | ""      | Currency symbol followed by a Space, like "R$ "         |
| suffix    | false    | String  | ""      | Percentage for example: " %"                            |
| masked    | false    | Boolean | false   | If the component output should include the mask or not  |
| disable-negative | false | Boolean | false | Component does not allow negative values              |
| disabled  | false    | Boolean | false   | Disable the inner input tag                             |
| min       | false    | Number  | Number.MIN_SAFE_INTEGER | The min value allowed                   |
| max       | false    | Number  | Number.MAX_SAFE_INTEGER | The max value allowed                   |
| allowBlank | false   | Boolean | false   | If the field can start blank and be cleared out by user |

### References

- https://github.com/vuejs-tips/v-money (based on `v-money`)
- https://en.wikipedia.org/wiki/Decimal_mark
- https://docs.oracle.com/cd/E19455-01/806-0169/overview-9/index.html
- http://www.xe.com/symbols.php
- https://github.com/kevinongko/vue-numeric
- https://github.com/plentz/jquery-maskmoney
