import { mount } from '@vue/test-utils'
import Money3 from '../src/component'
import VMoney3 from '../src/directive'

test('Test component', async () => {

    const props = {
        modelValue: '0',
        prefix: '$ ',
        suffix: ' m3'
    }
    const global = {
        directives: {
            money3: VMoney3
        }
    };

    const wrapper = mount(Money3, { props, global })

    const input = wrapper.find('input')

    await input.setValue('123.45')

    expect(input.element.value).toBe('$ 123.45 m3')
})
