import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TagSelect from './TagSelect.vue';

const benefits = [
    { id: 'bnf1', name: 'Coordination' },
    { id: 'bnf2', name: 'Attention' },
    { id: 'bnf3', name: 'Balance' },
];

type Benefit = (typeof benefits)[number];

function mountTagSelect(selected: Benefit[] = []) {
    return mount(TagSelect<Benefit>, {
        props: { items: benefits, displayKey: 'name', modelValue: selected },
    });
}

/** The dropdown's choices, which are the items not already picked. */
function choices(wrapper: ReturnType<typeof mountTagSelect>) {
    return wrapper.findAll('.menu li a').map(li => li.text());
}

describe('TagSelect', () => {
    it('offers every item when nothing is selected', () => {
        expect(choices(mountTagSelect())).toEqual(['Coordination', 'Attention', 'Balance']);
    });

    it('shows the selection as tags', () => {
        const wrapper = mountTagSelect([benefits[0]!]);

        expect(wrapper.findAll('.badge').map(b => b.text())).toEqual(['Coordination']);
    });

    it('stops offering what is already selected', () => {
        expect(choices(mountTagSelect([benefits[0]!]))).toEqual(['Attention', 'Balance']);
    });

    it('adds the item that was clicked', async () => {
        const wrapper = mountTagSelect();

        await wrapper.findAll('.menu li a')[1]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[benefits[1]]]);
    });

    it('removes the tag whose cross was clicked', async () => {
        const wrapper = mountTagSelect([benefits[0]!, benefits[1]!]);

        await wrapper.findAll('.badge button')[0]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[benefits[1]]]);
    });

    it('narrows the choices as the user types, ignoring case', async () => {
        const wrapper = mountTagSelect();

        await wrapper.find('input[type="text"]').setValue('ATT');

        expect(choices(wrapper)).toEqual(['Attention']);
    });

    it('says there is nothing left rather than showing an empty menu', async () => {
        const wrapper = mountTagSelect();

        await wrapper.find('input[type="text"]').setValue('nothing matches this');

        expect(wrapper.find('.menu').text()).toContain('No data');
    });
});
