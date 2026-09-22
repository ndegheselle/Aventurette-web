import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RangeInput from './RangeInput.vue';

describe('RangeInput', () => {
    it('binds each thumb to its own end', async () => {
        const wrapper = mount(RangeInput, { props: { min: 2, max: 8, ceiling: 10 } });
        const [low, high] = wrapper.findAll('input');

        await low!.setValue(4);
        await high!.setValue(6);

        expect(wrapper.emitted('update:min')).toEqual([[4]]);
        expect(wrapper.emitted('update:max')).toEqual([[6]]);
    });

    it('stops a thumb dragged past the other', async () => {
        const wrapper = mount(RangeInput, { props: { min: 2, max: 5, ceiling: 10 } });
        const [low] = wrapper.findAll('input');

        await low!.setValue(9);

        expect(wrapper.emitted('update:min')).toEqual([[5]]);
        expect((low!.element as HTMLInputElement).value).toBe('5');
    });
});
