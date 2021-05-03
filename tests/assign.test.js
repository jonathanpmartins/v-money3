import assign from '../src/assign'
test('assign undefined', () => {
  expect(assign(undefined, undefined)).toEqual({})
})

test('assign null', () => {
  expect(assign(null, null)).toEqual({})
})

test('assign error', () => {
  expect(assign({foo: 'foo'}, null)).toEqual({foo: 'foo'})
})

test('assign', () => {
  const defaults = {a: 1, b: 2}
  const config = {c: 3, a: 4}
  expect(assign(defaults, config)).toEqual(Object.assign({}, defaults, config))
})

test('falsy', () => {
  const defaults = {a: true, b: 2, c: 'teste'}
  const config = {a: false, b: null, c: ''}
  expect(assign(defaults, config)).toEqual(Object.assign({}, defaults, config))
})
