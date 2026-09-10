import { aBenefit, fakeCrud } from '@tests';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BenefitData } from '@features/activities/model/benefit';
import ActivitiesFilters from './ActivitiesFilters.vue';

const benefits = fakeCrud<BenefitData>();

vi.mock('@features/activities/api/benefits.api', () => ({
    get benefitsApi() { return benefits; },
}));

beforeEach(() => {
    benefits.items = [aBenefit({ name: 'Coordination' })];
});

async function mountFilters() {
    const wrapper = mount(ActivitiesFilters);
    await flushPromises();
    return wrapper;
}

/** The three toolbar buttons, then the modal's reset and apply. */
const toolbarButtons = (wrapper: any) => wrapper.findAll('section.flex.gap-1 button');
const ageInputs = (wrapper: any) => wrapper.findAll('input[type="number"]');
const applyButton = (wrapper: any) => wrapper.findAll('.modal-action button').at(-1)!;
const resetButton = (wrapper: any) => wrapper.findAll('.modal-action button')[0]!;

describe('ActivitiesFilters', () => {
    it('labels the toolbar with what can be filtered', async () => {
        const wrapper = await mountFilters();

        expect(toolbarButtons(wrapper).map((b: any) => b.text())).toEqual(['Age', 'Environment', 'Filter']);
    });

    it('offers the benefits the backend knows about', async () => {
        const wrapper = await mountFilters();

        expect(wrapper.text()).toContain('Coordination');
    });

    it('reports the criteria once they are applied', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[0]!.setValue(6);
        await applyButton(wrapper).trigger('click');

        const emitted = wrapper.emitted('change')?.[0]?.[0] as any;
        expect(emitted.filters).toEqual([
            expect.objectContaining({ key: 'ageMin', operator: 'greaterThan' }),
        ]);
    });

    it('reports nothing while the modal is still being filled in', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[0]!.setValue(6);

        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('shows the applied age range on the toolbar', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[0]!.setValue(6);
        await ageInputs(wrapper)[1]!.setValue(10);
        await applyButton(wrapper).trigger('click');

        expect(toolbarButtons(wrapper)[0]!.text()).toBe('Ages 6-10');
    });

    it('badges the filter button only for criteria no other button shows', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[2]!.setValue(15);
        await applyButton(wrapper).trigger('click');

        expect(toolbarButtons(wrapper)[2]!.find('.badge').exists()).toBe(true);
    });

    it('carries no badge for an age filter, which the age button already shows', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[0]!.setValue(6);
        await applyButton(wrapper).trigger('click');

        expect(toolbarButtons(wrapper)[2]!.find('.badge').exists()).toBe(false);
    });

    it('empties the form on reset without re-querying', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');
        await ageInputs(wrapper)[0]!.setValue(6);

        await resetButton(wrapper).trigger('click');

        expect((ageInputs(wrapper)[0]!.element as HTMLInputElement).value).toBe('');
        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('updates the bound model alongside the change event', async () => {
        const wrapper = await mountFilters();
        await toolbarButtons(wrapper)[0]!.trigger('click');

        await ageInputs(wrapper)[0]!.setValue(6);
        await applyButton(wrapper).trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0])
            .toEqual(wrapper.emitted('change')?.at(-1)?.[0]);
    });
});
