import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Pagination from './Pagination.vue';

function mountPagination(props: { total: number; page?: number; perPage?: number }) {
    return mount(Pagination, { props: { page: 1, perPage: 5, ...props } });
}

/** The pager's buttons, in the order they appear: first, previous, next, last. */
const [FIRST, PREVIOUS, NEXT, LAST] = [0, 1, 2, 3];

function click(wrapper: ReturnType<typeof mountPagination>, index: number) {
    return wrapper.findAll('button')[index]!.trigger('click');
}

function isDisabled(wrapper: ReturnType<typeof mountPagination>, index: number) {
    return wrapper.findAll('button')[index]!.classes('btn-disabled');
}

describe('Pagination', () => {
    it('shows the current page out of the total', () => {
        expect(mountPagination({ total: 12, perPage: 5 }).text()).toContain('1 / 3');
    });

    it('shows one page when there is nothing to page through', () => {
        expect(mountPagination({ total: 0 }).text()).toContain('1 / 1');
    });

    it('shows the range of rows on screen', () => {
        const wrapper = mountPagination({ total: 12, page: 2, perPage: 5 });

        expect(wrapper.text()).toContain('6 - 10');
    });

    it('does not claim rows beyond the total on the last page', () => {
        const wrapper = mountPagination({ total: 12, page: 3, perPage: 5 });

        expect(wrapper.text()).toContain('11 - 12');
    });

    it('asks for the next page and reports the change', async () => {
        const wrapper = mountPagination({ total: 12, perPage: 5 });

        await click(wrapper, NEXT);

        expect(wrapper.props('page')).toBe(1);
        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2]);
        expect(wrapper.emitted('change')).toHaveLength(1);
    });

    it('jumps to the last page', async () => {
        const wrapper = mountPagination({ total: 12, perPage: 5 });

        await click(wrapper, LAST);

        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([3]);
    });

    it('disables going back on the first page, and forward on the last', () => {
        const first = mountPagination({ total: 12, page: 1, perPage: 5 });
        expect([isDisabled(first, FIRST), isDisabled(first, PREVIOUS)]).toEqual([true, true]);
        expect(isDisabled(first, NEXT)).toBe(false);

        const last = mountPagination({ total: 12, page: 3, perPage: 5 });
        expect([isDisabled(last, NEXT), isDisabled(last, LAST)]).toEqual([true, true]);
    });

    it('emits nothing for a click that would not move the page', async () => {
        const wrapper = mountPagination({ total: 12, page: 1, perPage: 5 });

        await click(wrapper, PREVIOUS);

        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('returns to page one when the page size changes, since the offset no longer means anything', async () => {
        const wrapper = mountPagination({ total: 100, page: 4, perPage: 5 });

        await wrapper.find('select').setValue(25);

        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([1]);
        expect(wrapper.emitted('change')?.length).toBeGreaterThanOrEqual(1);
    });

    it('pulls the page back into range when the result set shrinks under it', async () => {
        const wrapper = mountPagination({ total: 100, page: 10, perPage: 5 });

        await wrapper.setProps({ total: 12 });

        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([3]);
    });

    it('settles at once rather than clamping repeatedly', async () => {
        const wrapper = mountPagination({ total: 100, page: 10, perPage: 5 });

        await wrapper.setProps({ total: 12 });

        expect(wrapper.emitted('update:page')).toHaveLength(1);
    });
});
