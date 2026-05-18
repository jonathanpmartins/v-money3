![workflow](https://github.com/jonathanpmartins/v-money3/actions/workflows/main.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/v-money3.svg)](https://www.npmjs.com/package/v-money3)
[![npm downloads](https://img.shields.io/npm/dm/v-money3.svg)](https://www.npmjs.com/package/v-money3)
[![bundle size](https://img.shields.io/bundlephobia/minzip/v-money3)](https://bundlephobia.com/package/v-money3)
[![license](https://img.shields.io/npm/l/v-money3.svg)](./LICENCE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# Money Mask for Vue 3

### [View Demo](https://jonathanpmartins.github.io/v-money3/example/index.html)

![The Mask Money](https://cdn-images-1.medium.com/max/600/1*Rpc289FpghuHrnzyVpOUig.gif)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Register Globally](#register-globally)
  - [Component](#use-as-component)
  - [Directive](#use-as-directive)
  - [Wrapper components (Vuetify, Nuxt UI, …)](#use-with-wrapper-components-vuetify-nuxt-ui-element-plus-)
  - [Min / Max limits](#min--max-limits)
- [TypeScript](#typescript)
- [Properties reference](#properties)
- [Restricted characters](#restricted-characters)
- [BigInt / Arbitrary precision](#bigint--arbitrary-precision)
- [Browser target](#browser-target)
- [Use without a package manager](#use-without-a-package-manager)
- [Internal mask functions](#use-the-internal-mask-functions)
- [Changelog](#changelog) · [License](#license) · [Contributing](#contribution-and-feedback)

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

## Installation

Requires `vue >= 3.2.0` (declared as a peer dependency).

```bash
npm i v-money3 --save
```

## Configuration

All component, directive, and `format`/`unformat` calls accept the same config object. Defaults shown below; every field is optional except `precision`.

```js
const config = {
  masked: false,                // emit raw value (false) or formatted string (true) via v-model
  prefix: '',                   // e.g. 'R$ '
  suffix: '',                   // e.g. ' %'
  thousands: ',',
  decimal: '.',
  precision: 2,
  disableNegative: false,
  disabled: false,
  min: null,                    // number | string | null
  max: null,                    // number | string | null
  setMaxIfBigger: true,         // false to reject keystrokes above `max` instead of clamping
  allowBlank: false,
  treatZeroAsBlank: true,
  minimumNumberOfCharacters: 0,
  shouldRound: true,
  focusOnRight: false,
}
```

See [Properties reference](#properties) for full per-field semantics.

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
        config: { /* see Configuration above for all fields + defaults */ }
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
        config: { /* see Configuration above for all fields + defaults */ }
      }
    },
    directives: { money3: Money3Directive }
  }
</script>
```

By default, directives are only compatible with `v-model`. It's important to note that using `v-model.number` directly on directives is not supported.
If you need to work with `float` or `integer` on directives, you'll need to manually configure the number modifier.

Using config:
```javascript
modelModifiers: {
  number: true,
}
```
If you directly bind it, you're perfectly fine as well:
```html
<input :model-modifiers="{ number: true }" v-model.lazy="amount" v-money3="config" />
```

### Use with wrapper components (Vuetify, Nuxt UI, Element Plus, …)

The directive works on any component that renders a single inner `<input>`. Apply it to the wrapper and it walks the host's DOM to find the inner input and attach its listeners there.

```html
<template>
  <!-- Vuetify -->
  <v-text-field v-money3="config" v-model="amount" label="Amount" />

  <!-- Nuxt UI -->
  <UInput v-money3="config" v-model="amount" />

  <!-- Element Plus -->
  <el-input v-money3="config" v-model="amount" />
</template>
```

<details>
<summary>How it works (and the <code>__v_money3_synth__</code> marker)</summary>

Wrapper components attach their own `@input` listener to the inner input during render, before the directive's `mounted()` runs. Because DOM listener-order is registration-order, the wrapper's handler would otherwise fire on the raw pre-reformat keystroke value, leaving the host's `v-model` one character behind the displayed value (reported as an "off-by-10" in [#78](https://github.com/jonathanpmartins/v-money3/issues/78)). To fix this without framework-specific detection, the directive re-dispatches an `input` event after each reformat so the wrapper re-reads the post-format value. The re-dispatch only happens when the directive sits on a wrapper (`host !== <input>`); bare `<input v-money3>` is unaffected.

The synthetic event is dispatched with `bubbles: false`, so it only reaches listeners attached directly to the inner `<input>` (the wrapper's own `@input` handler). Ancestor listeners — e.g. an `@input` on a parent `<div>` or `<form>` — do not see it. If you do attach a listener directly to the inner input and want to skip the directive's re-dispatch, filter on the marker:

```js
function onInput(e) {
  if (e.__v_money3_synth__) return; // skip the directive's re-dispatch
  // …your handler…
}
```

</details>

### Min / Max limits

Constrain input to a numeric range. Both bounds are optional.

```html
<money3
  v-model="amount"
  :min="0"
  :max="1000"
  :precision="2"
/>
```

- `max` defaults to **clamping** values above the ceiling down to `max`.
- Set `:set-max-if-bigger="false"` to **reject** keystrokes that would exceed `max` instead — the input keeps its last valid value rather than jumping to the ceiling.
- `min` rejects values below the floor; combine with `:disable-negative="true"` to forbid the `-` sign entirely.

## TypeScript

Types ship with the package — no separate `@types/` install needed.

```ts
import {
  Money3Component,
  Money3Directive,
  format,
  unformat,
  type VMoneyOptions,
} from 'v-money3';

const config: Partial<VMoneyOptions> = {
  prefix: 'R$ ',
  decimal: ',',
  thousands: '.',
  precision: 2,
};

const display: string = format(12345.67, config as VMoneyOptions);
```

`VMoneyOptions` covers every config field used by the component, directive, and the standalone `format` / `unformat` helpers.

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
| set-max-if-bigger            | false    | Boolean  | true    | When `true` (default), values above `max` are clamped down to `max`. Set to `false` to reject keystrokes that would exceed `max` — the input keeps its last valid value instead of jumping to the ceiling. No effect when `max` is `null` |
| allow-blank                  | false    | Boolean  | false   | If the field can start blank and be cleared out by user    |
| treat-zero-as-blank          | false    | Boolean  | true    | When `allow-blank` is true, controls whether zero is rendered as blank. Set to `false` to distinguish zero from blank (e.g. show `0.00` and only blank on empty input). Has no effect when `allow-blank` is false |
| minimum-number-of-characters | false    | Number   | 0       | The minimum number of characters that the mask should show |
| should-round                 | false    | Boolean  | true    | Should default values be rounded or sliced                 |
| focus-on-right               | false    | Boolean  | false   | When focus, set the cursor to the far right                |


## Restricted characters

The following config fields may **not** contain digits (`0-9`) or sign characters (`+`, `-`):

- `decimal`
- `thousands`
- `prefix`
- `suffix`

Any restricted character found in these fields is stripped from the final mask, and a `console.warn` is emitted with the offending value. This prevents ambiguity when parsing user input — e.g. a `prefix` of `"-$"` would collide with the negative-sign detection.


## BigInt / Arbitrary precision

`v-money3` supports arbitrary precision through the use of `BigInt`. Arbitrary precision is only supported with `v-model`. When using `v-model`, ensure the input is provided as a string representation of a number (e.g., `'12345.67'`). If your precision is set to `2` and you provide a default `v-model` value of `'55'`, it will be interpreted as `'0.55'`. To maintain the correct format, ensure you pass `'55.00'` when using `v-model`.

For most users, it's advisable to utilize floating-point numbers and adhere to the boundaries of [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number). In such cases, employing `v-model` with the number modifier, or `v-model.number`, is recommended. However, this limits you to numbers smaller than `2^53 - 1` or `9007199254740991` (approximately nine quadrillion). Refer to [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) for more information. For users employing `v-model.number`, integers and floats are intuitively understood. If your precision is set to `2` and you input a default `v-model.number` value of `55`, it will be interpreted as `55.00`. The same applies to `5.5`, which will be rendered as `5.50`.

[More examples](https://github.com/jonathanpmartins/v-money3/issues/38#issuecomment-903214235)

## Browser target

If you encounter the error message: `Big integer literals are not available in the configured target environment`, please ensure your browser targets are updated to include at least the following entries:

```
['es2020', 'safari14']
```

Can I use `bigInt`? https://caniuse.com/bigint

More information: [#66](https://github.com/jonathanpmartins/v-money3/issues/66), [#70](https://github.com/jonathanpmartins/v-money3/issues/70), [#89](https://github.com/jonathanpmartins/v-money3/issues/89)


## Use without a package manager

Drop the UMD build straight into a `<script>` tag:

```html
<script src="https://unpkg.com/v-money3@latest/dist/v-money3.umd.js"></script>
```

Take a look at issue [#15](https://github.com/jonathanpmartins/v-money3/issues/15#issuecomment-830988807) and also this [codesandbox](https://codesandbox.io/s/mystifying-paper-bpfyn?file=/index.html) working example.

## Use the internal mask functions

```javascript
import { format, unformat } from 'v-money3';

const config = {
    masked: false,
    prefix: 'R$ ',
    suffix: ' #',
    thousands: '.',
    decimal: ',',
    precision: 2,
    disableNegative: false,
    disabled: false,
    min: null,
    max: null,
    setMaxIfBigger: true,
    allowBlank: false,
    treatZeroAsBlank: true,
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

const unformattedString = unformat(formatted, config);
console.log(unformattedString);
// output fixed string: '12345.67'

/* ----------------- or ----------------- */

config.modelModifiers = { number: true };

const unformattedNumber = unformat(formatted, config);
console.log(unformattedNumber);
// output float number: 12345.67
```


## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

[MIT](./LICENCE) © Jonathan Martins

## Contribution and Feedback

Your contributions and feedback are highly valued! If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on GitHub.

The previous `v-money` library has been abandoned, prompting the development of v-money3 to accommodate projects migrating to `Vue 3`.

Happy coding with v-money3!


## References

- https://github.com/vuejs-tips/v-money (based on `v-money`)

