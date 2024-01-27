![workflow](https://github.com/jonathanpmartins/v-money3/actions/workflows/main.yml/badge.svg)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# Money Mask for Vue 3

### [View Demo](https://jonathanpmartins.github.io/v-money3/example/index.html)

![The Mask Money](https://cdn-images-1.medium.com/max/600/1*Rpc289FpghuHrnzyVpOUig.gif)

## Disclaimer

The old [`v-money`](https://github.com/vuejs-tips/v-money) library seems to be abandoned!
Since I use it in many projects and part of then will be upgraded to Vue3,
I needed it to work after the upgrades.

Feel free to open an issue or post a pull request!

## Features

- Arbitrary Precision with `BigInt`
- Lightweight (<4KB gzipped)
- Dependency free
- Mobile support
- Component or Directive flavors
- Accept copy/paste
- Editable
- Min / Max Limits

## Arbitrary precision

Arbitrary precision is only supported with `v-model`.
It expects to receive a string representation of a number, such as `'12345.67'`

Some break changes were introduced in this release.
Let's follow a train of thought:   
If your precision is set to `2` and you set a default model value of `'55'`, 
it will be interpreted as `'0.55'`.
To instruct the correct format on setup you need to pass in `'55.00'`
when using `v-model`. The same is true for `'5.5'`.
It will be interpreted as `'0.55'`. Another example: `'55.5'` => `'5.55'`.
Arbitrary precision is supported by using `string` and `BigInt` with `v-model`.

For the majority of users, it will make sense to use float numbers and stay within the
boundaries of [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).
If you fit this instance, you need to use `v-model`
with the number modifier, or `v-model.number`. But than,
you are stuck with numbers smaller than `2^53 - 1` or
`9007199254740991` or `9,007,199,254,740,991`. - Little more than nine quadrilion...
See [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER).

For those who are using `v-model.number`, integers and floats are completely
understood.  
Let's follow another train of thought:  
If your precision is set to `2` and you set a default model value of `55`,
it will be interpreted as `55.00`. The same is true for `5.5`.
It will be interpreted as `5.50`. Another example: `55.5` => `55.50`.

[More Examples](https://github.com/jonathanpmartins/v-money3/issues/38#issuecomment-903214235)

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
        amount: '12345.67',
        config: {
          masked: false,
          prefix: '',
          suffix: '',
          thousands: ',',
          decimal: '.',
          precision: 2,
          disableNegative: false,
          disabled: false,
          min: null,
          max: null,
          allowBlank: false,
          minimumNumberOfCharacters: 0,
          shouldRound: true,
          focusOnRight: false,
        }
      }
    }
  }
</script>
```

### Component v-model number modifier ([view codesandbox](https://codesandbox.io/s/v-money3-use-as-component-forked-523de?file=/src/App.vue))

`v-model` will always return a string.
If the `masked` property is set to true it will be formatted,
otherwise it will be a fixed string representation of a float number.
If you need your model to be a float number use the `number` modifier.
Ex.: `v-model.number="amount"`

- `v-model="amount"` will return a fixed string with typeof `string`.
Ex.: "123456.78"
- `v-model.number="amount"` will return a float number with typeof
`number`. Ex.: 123456.78

```html
<template>
  <money3 v-model.number="amount" v-bind="config"></money3>
</template>

<script>
  import { Money3Component } from 'v-money3'

  export default {
    components: { money3: Money3Component },
    data () {
      return {
        amount: 12345.67,
        config: { ... }
      }
    }
  }
</script>
```

### Use as directive ([view codesandbox](https://codesandbox.io/s/v-money3-use-as-directive-e7ror?file=/src/App.vue))
Must use `v-model.lazy` to bind works properly.
```html
<template>
  <input v-model.lazy="amount" v-money3="config" />
</template>

<script>
  import { Money3Directive } from 'v-money3'

  export default {
    data () {
      return {
        amount: '12345.67',
        config: {
          prefix: '',
          suffix: '',
          thousands: ',',
          decimal: '.',
          precision: 2,
          disableNegative: false,
          disabled: false,
          min: null,
          max: null,
          allowBlank: false,
          minimumNumberOfCharacters: 0,
          shouldRound: true,
          focusOnRight: false,
        }
      }
    },
    directives: { money3: Money3Directive }
  }
</script>
```

By default, directives work with `v-model`.
It is not possible to use `v-model.number` on directives, so, if you need
to work with floats/integers on directives you need to configure the `number`
modifier manually.

Using config:
```javascipt
modelModifiers: {
  number: true,
}
```
If you bind it directly you are just fine too:
```html
<input :model-modifiers="{ number: true }" v-model.lazy="amount" v-money3="config" />
```

## Properties

| property                     | Required | Type     | Default | Description                                                |
|------------------------------|----------|----------|---------|------------------------------------------------------------|
| precision                    | **true** | Number   | 2       | How many decimal places                                    |
| decimal                      | false    | String   | "."     | Decimal separator                                          |
| thousands                    | false    | String   | ","     | Thousands separator                                        |
| prefix                       | false    | String   | ""      | Currency symbol followed by a Space, like "R$ "            |
| suffix                       | false    | String   | ""      | Percentage for example: " %"                               |
| masked                       | false    | Boolean  | false   | If the component output should include the mask or not     |
| disable-negative             | false    | Boolean  | false   | Component does not allow negative values                   |
| disabled                     | false    | Boolean  | false   | Disable the inner input tag                                |
| min                          | false    | Number   | null    | The min value allowed                                      |
| max                          | false    | Number   | null    | The max value allowed                                      |
| allow-blank                  | false    | Boolean  | false   | If the field can start blank and be cleared out by user    |
| minimum-number-of-characters | false    | Number   | 0       | The minimum number of characters that the mask should show |
| should-round                 | false    | Boolean  | true    | Should default values be rounded or sliced                 |
| focus-on-right               | false    | Boolean  | false   | When focus, set the cursor to the far right                |


## Restricted Characters

Numbers `0-9` and the following characters...

- `+`
- `-`

...are restricted on following properties: 
- `decimal`
- `thousands`
- `prefix`
- `suffix`

Restricted inputs will be filter out of the final mask.
A console warn with more information will be shown!


## Don't want to use a package manager?

Use it directly in the browser! 

```html
<script src="https://unpkg.com/v-money3@3.24.1/dist/v-money3.umd.js"></script>
```

Take a look at issue [#15](https://github.com/jonathanpmartins/v-money3/issues/15#issuecomment-830988807) and also this [codesandbox](https://codesandbox.io/s/mystifying-paper-bpfyn?file=/index.html) working example.

## Use the internal mask functions

```javascript
import { format, unformat } from 'v-money3';

const config = {
    debug: false,
    masked: false,
    prefix: '',
    suffix: '',
    thousands: ',',
    decimal: '.',
    precision: 2,
    disableNegative: false,
    disabled: false,
    min: null,
    max: null,
    allowBlank: false,
    minimumNumberOfCharacters: 0,
    modelModifiers: {
        number: false,
    },
    shouldRound: true,
    focusOnRight: false,
}

const formatted = format(12345.67, config);
console.log(formatted);
// output string: 'R$ 12.345,67 #'

const unformatted = unformat(formatted, config);
console.log(unformatted);
// output fixed string: '12345.67'

/* ----------------- or ----------------- */

config.modelModifiers = { number: true };

const unformatted = unformat(formatted, config);
console.log(unformatted);
// output float number: 12345.67
```

### References

- https://github.com/vuejs-tips/v-money (based on `v-money`)
