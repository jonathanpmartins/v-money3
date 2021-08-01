# Changelog

All notable changes to this project will be documented in this file.

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
