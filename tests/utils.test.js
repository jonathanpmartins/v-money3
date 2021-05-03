import { format, unformat } from '../src/utils'
import defaults from '../src/options'

test ('format function should parse numbers and strings', () => {

    expect(format('$123.001')).toBe('1,230.01')

    expect(format('')).toBe('0.00')
    expect(format(123.45)).toBe('123.45')

    expect(format(123.45, {...defaults, prefix: 'R$ '})).toBe('R$ 123.45')
    expect(format(123.45, {...defaults, suffix: '/100'})).toBe('123.45/100')

    expect(format(1123.45, {...defaults, thousands: '.', decimal: ','})).toBe('1.123,45')

    expect(format(-1, {...defaults, disableNegative: true})).toBe('1.00')
    expect(format('-123.45', {...defaults, disableNegative: true})).toBe('123.45')

    expect(format(9, {...defaults, min: 10})).toBe('10.00')
    expect(format(11, {...defaults, min: 10})).toBe('11.00')
    expect(format(9.99, {...defaults, min: 10})).toBe('10.00')

    expect(format(9, {...defaults, max: 10})).toBe('9.00')
    expect(format(11, {...defaults, max: 10})).toBe('10.00')
    expect(format(10.01, {...defaults, max: 10})).toBe('10.00')

    expect(format('', {...defaults, allowBlank: true})).toBe('')

    expect(format(123.45, {...defaults, minimumNumberOfCharacters: 7})).toBe('00,123.45')
})

test ('unformat number should strip the string', () => {

    expect(unformat('R$ 1.123,45/100', {
        ...defaults,
        prefix: 'R$ ',
        suffix: '/100',
        thousands: '.',
        decimal: ',',
    })).toBe(1123.45)
})
