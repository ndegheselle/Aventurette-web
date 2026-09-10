import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import List from './List.vue';

const items = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }];

function mountList(props: Record<string, unknown>) {
    return mount(List, {
        props,
        slots: { default: '<span class="row">{{ params.index }}:{{ params.item.name }}</span>' },
    });
}

describe('List', () => {
    it('renders a row per item, with its index', () => {
        const wrapper = mountList({ items });

        expect(wrapper.findAll('.row').map(r => r.text())).toEqual(['0:Alpha', '1:Beta']);
    });

    it('says so when there is nothing, rather than rendering an empty box', () => {
        expect(mountList({ items: [] }).text()).toContain('No data');
    });

    it('treats a missing list the same as an empty one', () => {
        expect(mountList({}).text()).toContain('No data');
    });

    it('shows no empty state once there are items', () => {
        expect(mountList({ items }).text()).not.toContain('No data');
    });
});
