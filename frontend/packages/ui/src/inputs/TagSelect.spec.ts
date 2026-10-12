import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TagSelect from './TagSelect.vue';

const art = { id: 'a', name: 'Art' };
const forest = { id: 'b', name: 'Forest' };

type Option = typeof art;

function offered(props: { modelValue: Option[], keyBy?: keyof Option }) {
    const wrapper = mount(TagSelect<Option>, { props: { items: [art, forest], displayKey: 'name', ...props } });
    return wrapper.findAll('.menu a').map(option => option.text());
}

describe('TagSelect', () => {
    it('stops offering what is picked', () => {
        expect(offered({ modelValue: [forest] })).toEqual(['Art']);
    });

    it('matches a copy to its option by keyBy', () => {
        // The field holds its own copy of the row, from another read.
        expect(offered({ modelValue: [{ ...forest }], keyBy: 'id' })).toEqual(['Art']);
    });
});
