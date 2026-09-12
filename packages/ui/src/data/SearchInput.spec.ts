import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchInput from './SearchInput.vue';

describe('SearchInput', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('waits for the typing to stop before searching', async () => {
        const wrapper = mount(SearchInput, { props: { delay: 300 } });

        await wrapper.find('input').setValue('hu');
        await wrapper.find('input').setValue('hunt');
        expect(wrapper.emitted('search')).toBeUndefined();

        vi.advanceTimersByTime(300);
        expect(wrapper.emitted('search')).toEqual([['hunt']]);
    });

    it('searches on every keystroke when the delay is turned off', async () => {
        const wrapper = mount(SearchInput, { props: { delay: 0 } });

        await wrapper.find('input').setValue('h');
        await wrapper.find('input').setValue('hu');

        expect(wrapper.emitted('search')).toEqual([['h'], ['hu']]);
    });

    it('offers no clear button until there is something to clear', async () => {
        const wrapper = mount(SearchInput, { props: { modelValue: '' } });

        expect(wrapper.find('button').exists()).toBe(false);

        await wrapper.setProps({ modelValue: 'hunt' });
        expect(wrapper.find('button').exists()).toBe(true);
    });

    it('clearing empties the field and searches again, so the list comes back', async () => {
        const wrapper = mount(SearchInput, { props: { modelValue: 'hunt', delay: 0 } });

        await wrapper.find('button').trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['']);
        expect(wrapper.emitted('search')?.at(-1)).toEqual(['']);
    });
});
