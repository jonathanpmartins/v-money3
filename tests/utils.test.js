import { format } from '../src/utils'

test ('format should parse numbers', () => {
    expect(format('123')).toBe('123.00')
})

test ('format should parse strings', () => {
    expect(format('$123.001')).toBe('1,230.01')
})
