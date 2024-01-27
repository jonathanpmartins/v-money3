# Changelog

All notable changes to this project will be documented in this file.

## [3.24.1] / 2024-01-27
#### Fix 
 - Fix typescript error TS7016. Pull request [#84](https://github.com/jonathanpmartins/v-money3/pull/84), thanks to [@christhofer](https://github.com/christhofer).

## [3.24.0] / 2023-03-22

### Feature
- New property `focusOnRight` brings back the default behaviour on the old v-money library. Requested by [@SDIjeremy](https://github.com/SDIjeremy) in issue [#77](https://github.com/jonathanpmartins/v-money3/pull/77).
### Update
- Added access to variables when extending class. Pull request [#81](https://github.com/jonathanpmartins/v-money3/pull/81), thanks to [@joserick](https://github.com/joserick).

## [3.23.0] / 2023-02-08

#### Fix issue [#56](https://github.com/jonathanpmartins/v-money3/issues/56). Thanks to [@ivancorrea](https://github.com/ivancorrea).
#### "npm update" development dependencies.

## [3.22.3] / 2022-12-16

#### npm audit report @ 2022-12-16 02:12 UTC

### Before
```shell
$ npm audit;

decode-uri-component  <0.2.1
decode-uri-component vulnerable to Denial of Service (DoS) - https://github.com/advisories/GHSA-w573-4hg7-7wgq
fix available via `npm audit fix`
node_modules/decode-uri-component

1 low severity vulnerability
```
### Fix
```shell
npm run update;
```

### After
```shell
$ npm audit;

found 0 vulnerabilities
```

## [3.22.2] / 2022-10-19

### Build Change

- "Safari14" added to build target on vite.config.js

## [3.22.1] / 2022-09-27

### Fix

- Correcting module import

## [3.22.0] / 2022-09-26

### Feature

- Possibility to start with negative symbol. Pull request [#69](https://github.com/jonathanpmartins/v-money3/pull/69) thanks to [@ddlaat](https://github.com/ddlaat)

## [3.21.1] / 2022-02-15

### Update

- `npm update` dependencies.

## [3.21.0] / 2022-01-19

### Feature

- Properly exporting typescript types. Pull request [#54](https://github.com/jonathanpmartins/v-money3/pull/54) thanks to [@sambitevidev](https://github.com/sambitevidev)

## [3.20.1] / 2021-10-05

### Fix

- Fixing a problem with multiple components in a loop sharing the same config options. Issue [#49](https://github.com/jonathanpmartins/v-money3/issues/49) 

## [3.20.0] / 2021-09-25

### New export

- Exporting `BigNumber` class. See issue [#48](https://github.com/jonathanpmartins/v-money3/issues/48)
- TS improvements.
- Dev dependencies upgrade.

## [3.19.1] / 2021-09-10

### Improvements

- Smaller bundle by +6%. See pull request [#47](https://github.com/jonathanpmartins/v-money3/pull/47)

## [3.19.0] / 2021-09-10

### Improvements

- Upgrade package to TypeScript. Issue [#41](https://github.com/jonathanpmartins/v-money3/issues/41) and Pull Request [#46](https://github.com/jonathanpmartins/v-money3/pull/46). Thanks to [@gigioSouza](https://github.com/gigioSouza)

## [3.18.0] / 2021-09-09

### Improvements

- Complete `should-round` feature. Issue [#45](https://github.com/jonathanpmartins/v-money3/issues/45)

## [3.17.6] / 2021-09-07

### Improvements

- Vue 3.2.0+ added as a peerDependency in package.json file. Issue [#44](https://github.com/jonathanpmartins/v-money3/issues/44)
- Opt to avoid round precision. Issue [#45](https://github.com/jonathanpmartins/v-money3/issues/45)

## [3.17.5] / 2021-08-30

### Fix

- Fixing problem with first digit [#43](https://github.com/jonathanpmartins/v-money3/issues/43)

## [3.17.4] / 2021-08-30

### Fix

- Fixing problem with `v-model.number` [#42](https://github.com/jonathanpmartins/v-money3/issues/42)
- Fixing reactivity problem with options.

## [3.17.3] / 2021-08-23

### Changes

- Numbers `0-9`, `+` and `-` are restricted from the following options:
`prefix`, `suffix`, `thousands` and `decimal`. In the past we `throw new Error`,
but this could cause problems with reactivity. Currectly we filter out the above
restricted characters from the restricted options.
- Max precision was changed from `20` to `1000`.
- Removing `assign` method and tests.
- Code coverage improved.

## [3.17.2] / 2021-08-23

### Improvements

- `lastKnownValue` was removed from directives `setValue` method. It was causing issues with reactivity.

## [3.17.1] / 2021-08-22

### Fix

- Fixing a problem when using precision "0" zero with thousands "." dot. Issue [#39](https://github.com/jonathanpmartins/v-money3/issues/39).

## [3.17.0] / 2021-08-22

### Refactoring

- Codebase refactoring... See [AndrolGenhald](https://github.com/AndrolGenhald)
super helpful collaboration with this [pull request](https://github.com/jonathanpmartins/v-money3/pull/34)
and this critical [issue](https://github.com/jonathanpmartins/v-money3/issues/26).
- [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
support introduced via native [BigNumber class](https://github.com/jonathanpmartins/v-money3/blob/main/src/BigNumber.js).
- `v-model` and `v-model.number` are now treated completely differently.
See [docs](https://github.com/jonathanpmartins/v-money3/blob/main/README.md)
and [examples](https://github.com/jonathanpmartins/v-money3/issues/38#issuecomment-903214235).
- Bundle compiled with `es2020` target. This is necessary to support full native BigInt.
- Many other changes... See [diff](https://github.com/jonathanpmartins/v-money3/compare/v3.16.1...v3.17.0).


## [3.16.1] / 2021-08-10

### Fix

- Fixing problem with `allow-blank` option that did not work on precision other than 2.

## [3.16.0] / 2021-08-10

### Break Changes

- `v-model` will always return a string. If `masked` is set to true, it will be formatted, otherwise a fixed string representation of a float number will be received. To receive a float number directly in your model use `v-model.number`. See [#27](https://github.com/jonathanpmartins/v-money3/issues/27)

## [3.15.2] / 2021-08-09

### Development improvment

- New `npm run bump-lock` script to mirror `package.json` version.
- Force the usage of node 16 on local tests.

## [3.15.1] / 2021-08-02

### Changes

- Pointing npm scripts to local binaries.
- Update CI to node 16.
- More e2e tests with puppeteer.
- Restrict `+` and `-` in some properties. See [#30](https://github.com/jonathanpmartins/v-money3/issues/30)
- Correct toggle for `-` and `+` signals. [#29](https://github.com/jonathanpmartins/v-money3/issues/29) 

## [3.15.0] / 2021-08-01

### Feature

- Exposing internal mask function. [#28](https://github.com/jonathanpmartins/v-money3/issues/28)

## [3.14.3] / 2021-08-01

### Changes

- Setup tests with puppeteer.
- Returning a float instead of a string to the model. [#27](https://github.com/jonathanpmartins/v-money3/issues/27)
- Fixing issues catch in the new tests that the old test didn't.

## [3.14.2] / 2021-07-30

### Bug

- Fixing an issue that broke a directive feature in the last release. [#23](https://github.com/jonathanpmartins/v-money3/pull/23) 

## [3.14.1] / 2021-07-30

### Bug

- Fixing bug where component were unusable with US format. [#22](https://github.com/jonathanpmartins/v-money3/issues/22)
- Fixing a problem with component that continues to mask the input value even if masked were set to `false`.

## [3.14.0] / 2021-07-29

### Change

- Directive does not set cursor position on focus anymore. [#20](https://github.com/jonathanpmartins/v-money3/issues/20)
- Component respect cursor position when focus through mouse click. [#20](https://github.com/jonathanpmartins/v-money3/issues/20)
- Fix odd behavior when replacing value after input selection. [#21](https://github.com/jonathanpmartins/v-money3/issues/21)

## [3.13.9] / 2021-07-27

### Change

- Update of all direct dependencies to latest compatible versions.

## [3.13.8] / 2021-07-27

### Bug + Tests

- Fix `null` v-model is throwing an exception.
- Component setup watch typo

## [3.13.7] / 2021-07-20

### Bug

Fixing a problem with cursor position when deleting a digit.

## [3.13.6] / 2021-06-02

### Bug

### Fixing a problem with v-model type when entering a `null value.

## [3.13.5] / 2021-05-13

### Improvement

- `console.log` removed from production code

## [3.13.4] / 2021-05-04

### Added

- Changelog added

## [3.13.3] / 2021-05-03

### Feature

- Demo page deployed

## 3.13.2 / 2021-05-03

### Skip

## [3.13.1] / 2021-05-03

### Bug

- Fixing a bug introduced in the last release.

## [3.13.0] / 2021-05-03

### Changes

- Re-declaring the directive following the vue 3 docs.

## [3.12.0] / 2021-05-03

### Feature

- Minimum number of characters feature

## [3.11.1] / 2021-05-03

### Test

- Better test coverage.

## [3.11.0] / 2021-05-03

### Feature

- Integration with Github CI.

## [3.10.3] / 2021-05-02

### Feature

- Making the plugin usable without a package manager.

## [3.10.2] / 2021-05-02

### Docs

- CodeSandbox examples added to the docs.

## [3.10.1] / 2021-05-01

### Docs

- Better Docs.

## [3.10.0] / 2021-04-30

### Critical Bugs

- This release fix a bug introduced in version 3.6.0 (listeners).
- This release also reverts the release 3.6.1 to its original code.

## [3.9.0] / 2021-04-30

### Feature

- Allow blank input using `allow-blank`.

## [3.8.0] / 2021-04-30

### Feature  

- `disabled` attribute added. Components can now be disabled.

## [3.7.0] / 2021-04-30

### Change

- Changes made on how to import the plugin.
- Backwards compatible.

## [3.6.1] / 2021-04-30

### Bug

- Memory Leak Fix.

## [3.6.0] / 2021-04-30

### Added

- MIT licence added.
- Applying all event listeners dynamically (make release useless).

## [3.5.0] / 2021-04-30

### Feature

- Blur event added.

## [3.4.0] / 2021-04-30

### Feature

- Supporting min/max range.

## [3.3.0] / 2021-04-30

### Test

- Installing and integrating Jest.
- Transporting the old tests from old repo.

## [3.2.0] / 2021-04-30

### Feature

- Disabling negative values with `disable-negative` attribute.

## [3.1.0] / 2021-04-30

### Feature

- Passing down the id attribute to the inner input tag. To be able to associate labels with the component.

## [3.0.1] / 2021-04-29

### Bug

- Solving Infinite Loop problem.

## [3.0.0] / 2021-04-29

### Genesis

- First Release with Vue 3 integration.

[3.24.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.24.1...v3.24.0
[3.24.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.24.0...v3.23.0
[3.23.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.23.0...v3.22.3
[3.22.3]: https://github.com/jonathanpmartins/v-money3/compare/v3.22.3...v3.22.2
[3.22.2]: https://github.com/jonathanpmartins/v-money3/compare/v3.22.2...v3.22.1
[3.22.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.22.1...v3.22.2
[3.22.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.22.0...v3.22.1
[3.22.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.21.1...v3.22.0
[3.21.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.21.0...v3.21.1
[3.21.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.20.1...v3.21.0
[3.20.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.20.0...v3.20.1
[3.20.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.19.1...v3.20.0
[3.19.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.19.0...v3.19.1
[3.19.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.18.0...v3.19.0
[3.18.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.6...v3.18.0
[3.17.6]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.5...v3.17.6
[3.17.5]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.4...v3.17.5
[3.17.4]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.3...v3.17.4
[3.17.3]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.2...v3.17.3
[3.17.2]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.1...v3.17.2
[3.17.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.17.0...v3.17.1
[3.17.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.16.1...v3.17.0
[3.16.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.16.0...v3.16.1
[3.16.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.15.2...v3.16.0
[3.15.2]: https://github.com/jonathanpmartins/v-money3/compare/v3.15.1...v3.15.2
[3.15.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.15.0...v3.15.1
[3.15.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.14.3...v3.15.0
[3.14.3]: https://github.com/jonathanpmartins/v-money3/compare/v3.14.2...v3.14.3
[3.14.2]: https://github.com/jonathanpmartins/v-money3/compare/v3.14.1...v3.14.2
[3.14.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.14.0...v3.14.1
[3.14.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.9...v3.14.0
[3.13.9]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.8...v3.13.9
[3.13.8]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.7...v3.13.8
[3.13.7]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.6...v3.13.7
[3.13.6]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.5...v3.13.6
[3.13.5]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.4...v3.13.5
[3.13.4]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.3...v3.13.4
[3.13.3]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.1...v3.13.3
[3.13.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.13.0...v3.13.1
[3.13.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.12.0...v3.13.0
[3.12.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.11.1...v3.12.0
[3.11.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.11.0...v3.11.1
[3.11.0]: https://github.com/jonathanpmartins/v-money3/compare/v3.10.3...v3.11.0
[3.10.3]: https://github.com/jonathanpmartins/v-money3/compare/v3.10.2...v3.10.3
[3.10.2]: https://github.com/jonathanpmartins/v-money3/compare/v3.10.1...v3.10.2
[3.10.1]: https://github.com/jonathanpmartins/v-money3/compare/v3.10.0...v3.10.1
[3.10.0]: https://github.com/jonathanpmartins/v-money3/compare/3.9.0...v3.10.0
[3.9.0]: https://github.com/jonathanpmartins/v-money3/compare/3.8.0...3.9.0
[3.8.0]: https://github.com/jonathanpmartins/v-money3/compare/3.7.0...3.8.0
[3.7.0]: https://github.com/jonathanpmartins/v-money3/compare/3.6.1...3.7.0
[3.6.1]: https://github.com/jonathanpmartins/v-money3/compare/3.6.0...3.6.1
[3.6.0]: https://github.com/jonathanpmartins/v-money3/compare/3.5.0...3.6.0
[3.5.0]: https://github.com/jonathanpmartins/v-money3/compare/3.4.0...3.5.0
[3.4.0]: https://github.com/jonathanpmartins/v-money3/compare/3.3.0...3.4.0
[3.3.0]: https://github.com/jonathanpmartins/v-money3/compare/3.2.0...3.3.0
[3.2.0]: https://github.com/jonathanpmartins/v-money3/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/jonathanpmartins/v-money3/compare/3.0.1...3.1.0
[3.0.1]: https://github.com/jonathanpmartins/v-money3/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/jonathanpmartins/v-money3/releases/tag/3.0.0
