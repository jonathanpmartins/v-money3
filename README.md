![workflow](https://github.com/jonathanpmartins/v-money3/actions/workflows/main.yml/badge.svg)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# Money Mask for Vue 3

### [View Demo](https://jonathanpmartins.github.io/v-money3/example/index.html)

![The Mask Money](https://cdn-images-1.medium.com/max/600/1*Rpc289FpghuHrnzyVpOUig.gif)

## Introduction

Welcome to `v-money3`, a versatile money masking solution designed specifically for `Vue 3` applications. This library serves as a replacement for the now-abandoned [`v-money`](https://github.com/vuejs-tips/v-money) library, ensuring compatibility and functionality for projects transitioning to `Vue 3`.

## Features

- **Arbitrary Precision:** Utilize [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) for precise calculations.
- **Lightweight:** Less than 4KB when gzipped.
- **Dependency-free:** No external dependencies for seamless integration.
- **Mobile Support:** Ensures a consistent experience across devices.
- **Component or Directive Flavors:** Choose between component-based or directive-based implementation.
- **Copy/Paste Support:** Easily accept input via copy/paste actions.
- **Min/Max Limits:** Set minimum and maximum limits for input values.

## Arbitrary Precision

In this release, some breaking changes have been introduced. Let's delve into the details:

`v-money3` supports arbitrary precision through the use of `BigInt`. Arbitrary precision is only supported with `v-model`. When using `v-model`, ensure the input is provided as a string representation of a number (e.g., `'12345.67'`). If your precision is set to `2` and you provide a default `v-model` value of `'55'`, it will be interpreted as `'0.55'`. To maintain the correct format, ensure you pass `'55.00'` when using `v-model`.


For most users, it's advisable to utilize floating-point numbers and adhere to the boundaries of [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number). In such cases, employing `v-model` with the number modifier, or `v-model.number`, is recommended. However, this limits you to numbers smaller than `2^53 - 1` or `9007199254740991` (approximately nine quadrillion). Refer to [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) for more information. For users employing `v-model.number`, integers and floats are intuitively understood. If your precision is set to `2` and you input a default `v-model.number` value of `55`, it will be interpreted as `55.00`. The same applies to `5.5`, which will be rendered as `5.50`.


[More Examples](https://github.com/jonathanpmartins/v-money3/issues/38#issuecomment-903214235)

## Browser Target

If you encounter the error message: `Big integer literals are not available in the configured target environment`, please ensure your browser targets are updated to include at least the following entries:
```
['es2020', 'safari14']
```
Can I use `bigInt`? https://caniuse.com/bigint

More information: [#66](https://github.com/jonathanpmartins/v-money3/issues/66), [#70](https://github.com/jonathanpmartins/v-money3/issues/70), [#89](https://github.com/jonathanpmartins/v-money3/issues/89)

## Installation

```bash
npm i v-money3 --save
```

## Usage

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

When using `v-model`, the returned value will always be a `string`.
If the `masked` property is set to `true`, it will be formatted accordingly; otherwise, it will be a fixed string representation of a floating-point number.
If you require your model to be a floating-point number, utilize the `number` modifier. For example:

- `v-model="amount"` will return a fixed string with a typeof `string`. For instance: `'123456.78'`
- `v-model.number="amount"` will return a floating-point number with a typeof `number`. For example: `123456.78`

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
To ensure proper functionality, you must use `v-model.lazy` for binding.
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

By default, directives are only compatible with `v-model`. It's important to note that using `v-model.number` directly on directives is not supported.
If you need to work with `float` or `integer` on directives, you'll need to manually configure the number modifier.

Using config:
```javascipt
modelModifiers: {
  number: true,
}
```
If you directly bind it, you're perfectly fine as well:
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

Restricted inputs will be filtered out of the final mask, and a console warning with more information will be displayed.


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


### Contribution and Feedback
Your contributions and feedback are highly valued! If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on GitHub.

The previous `v-money` library has been abandoned, prompting the development of v-money3 to accommodate projects migrating to `Vue 3`.

Happy coding with v-money3!


### References

- https://github.com/vuejs-tips/v-money (based on `v-money`)

