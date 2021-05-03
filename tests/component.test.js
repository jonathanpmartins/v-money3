import { mount } from '@vue/test-utils'
import Money3Component from '../src/component'
import Money3Directive from '../src/directive'
import {setCursor} from "../src/utils";

function mountComponent(attr = {}) {
    const props = {
        ...attr,
        modelValue: '0',
    }
    const global = {
        directives: {
            money3: Money3Directive
        }
    };
    return mount(Money3Component, { props, global })
}

test('Renders the component', async () => {

    const component = mountComponent({
        prefix: 'R$ ',
        suffix: '.000',
        thousands: ',',
        decimal: '.',
        precision: 3,
    });

    const input = component.find('input')

    await input.setValue('1123.45')

    expect(input.element.value).toBe('R$ 1,123.450.000')
})

test('Test prefix attribute', async () => {

    const data = ['$', '€', 'R$ ', '₿', '1\\', '2\\'];

    for (const prefix of data) {

        const input = mountComponent({ prefix }).find('input');

        await input.setValue('123.45')

        expect(input.element.value).toBe(prefix + '123.45')
    }
})

test('Test suffix attribute', async () => {

    const data = ['$', '€', 'R$ ', '₿', '.00', '($)', '/3'];

    for (const suffix of data) {

        const input = mountComponent({ suffix }).find('input');

        await input.setValue('123.45')

        expect(input.element.value).toBe('123.45' + suffix)
    }
})

test('Test thousands attribute', async () => {

    const data = ['.', '-', '|', '#', ';'];

    for (const thousands of data) {

        const input = mountComponent({ thousands }).find('input');

        await input.setValue(9999999999999)

        expect(input.element.value)
            .toBe(`9${thousands}999${thousands}999${thousands}999${thousands}999.00`)
    }
})

test('Test decimal attribute', async () => {

    const data = ['.', ',', '-', '#', ';', '\''];

    for (const decimal of data) {

        const input = mountComponent({ decimal }).find('input');

        await input.setValue(123.45)

        expect(input.element.value).toBe(`123${decimal}45`)
    }
})

test('Test precision attribute', async () => {

    for (let precision = 0; precision < 10; precision++) {

        const input = mountComponent({ precision }).find('input');

        const number = 123.4567891234

        await input.setValue(number)

        const toBe = number.toFixed(precision)

        expect(input.element.value).toBe(toBe)
    }
})

test('Test disable-negative attribute', async () => {

    const input = mountComponent({ disableNegative: true }).find('input');

    await input.setValue(1)

    expect(input.element.value).toBe('1.00')

    await input.setValue(-1)

    expect(input.element.value).toBe('1.00')
})

test('Test disable attribute', async () => {

    const disabled = true;

    const input = mountComponent({ disabled }).find('input');

    expect(input.element.disabled).toBe(disabled)
})

test('Test min attribute', async () => {

    const min = 10;

    const input = mountComponent({ min }).find('input');

    await input.setValue(11)

    expect(input.element.value).toBe('11.00')

    await input.setValue(9)

    expect(input.element.value).toBe('10.00')

    await input.setValue(9.99)

    expect(input.element.value).toBe('10.00')
})

test('Test max attribute', async () => {

    const max = 10;

    const input = mountComponent({ max }).find('input');

    await input.setValue(9)

    expect(input.element.value).toBe('9.00')

    await input.setValue(11)

    expect(input.element.value).toBe('10.00')

    await input.setValue(10.01)

    expect(input.element.value).toBe('10.00')
});

test('Test allow-blank attribute', async () => {

    const allowBlank = true;

    const input = mountComponent({ allowBlank }).find('input');

    await input.setValue('')

    expect(input.element.value).toBe('')
})

test('Change event is emitted', async () => {

    const component = mountComponent();
    const input = component.find('input');

    await input.setValue(123.45)

    expect(component.emitted()).toHaveProperty('change')

    const incrementEvent = component.emitted('change')
    incrementEvent.forEach((item) => {
        expect(item[0].target.value).toBe('123.45')
    });
})
