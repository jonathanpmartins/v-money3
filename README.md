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

```
npm i v-money3 --save
```

### Use as component

```html
<template>
  <div>
    <money3 v-model="amount" v-bind="config"></money3> {{ amount }}
  </div>
</template>

<script>
  import { Money3 } from 'v-money3'

  export default {
    components: { Money3 },
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
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
        }
      }
    }
  }
</script>
```

### Use as directive
Must use `v-model.lazy` to bind works properly.
```html
<template>
  <div>
    <input v-model.lazy="amount" v-money3="config" /> {{ amount }}
  </div>
</template>

<script>
  import { VMoney3 } from 'v-money3'

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
          min: Number.MIN_SAFE_INTEGER,
          max: Number.MAX_SAFE_INTEGER,
        }
      }
    },

    directives: { money3: VMoney3 }
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
| min       | false    | Number  | Number.MIN_SAFE_INTEGER | The min value allowed                   |
| max       | false    | Number  | Number.MAX_SAFE_INTEGER | The max value allowed                   |

### References

- https://github.com/vuejs-tips/v-money (based on `v-money`)
- https://en.wikipedia.org/wiki/Decimal_mark
- https://docs.oracle.com/cd/E19455-01/806-0169/overview-9/index.html
- http://www.xe.com/symbols.php
- https://github.com/kevinongko/vue-numeric
- https://github.com/plentz/jquery-maskmoney
