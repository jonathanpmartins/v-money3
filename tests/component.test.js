import { mount } from '@vue/test-utils'
import Money3 from '../src/component'

test('Test component prefix', async () => {

    const wrapper = mount(Money3, {
        props: {
            modelValue: '0',
            prefix: '$ '
        }
    })

    const input = wrapper.find('input')

    await input.setValue('123.45')

    expect(input.element.value).toBe('$ 123.45')
})
