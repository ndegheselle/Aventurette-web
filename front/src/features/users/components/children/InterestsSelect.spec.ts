import { anInterest, fakeCrud } from '@tests';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InterestData } from '@features/users/model/interest';
import InterestsSelect from './InterestsSelect.vue';

const interests = fakeCrud<InterestData>();

vi.mock('@features/users/api/interests.api', () => ({
    get interestsApi() { return interests; },
}));

const dinosaurs = anInterest({ name: 'Dinosaurs' });
const painting = anInterest({ name: 'Painting' });

beforeEach(() => {
    interests.items = [dinosaurs, painting];
});

async function mountSelect(selected: InterestData[] = []) {
    const wrapper = mount(InterestsSelect, { props: { selected } });
    await flushPromises();
    return wrapper;
}

const tags = (wrapper: any) => wrapper.findAll('.badge');
const selectedTags = (wrapper: any) => wrapper.findAll('.badge-primary');

describe('InterestsSelect', () => {
    it('offers every interest', async () => {
        const wrapper = await mountSelect();

        expect(tags(wrapper).map((t: any) => t.text())).toEqual(['Dinosaurs', 'Painting']);
    });

    it('highlights the ones the child already has', async () => {
        const wrapper = await mountSelect([painting]);

        expect(selectedTags(wrapper).map((t: any) => t.text())).toEqual(['Painting']);
    });

    it('marks by id, since the child\'s interests are a different fetch', async () => {
        const wrapper = await mountSelect([{ ...painting }]);

        expect(selectedTags(wrapper)).toHaveLength(1);
    });

    it('reports the interest added when one is clicked', async () => {
        const wrapper = await mountSelect();

        await tags(wrapper)[0]!.trigger('click');

        expect(wrapper.emitted('update:selected')?.at(-1)?.[0]).toEqual([dinosaurs]);
    });

    it('reports the interest removed when a selected one is clicked again', async () => {
        const wrapper = await mountSelect([dinosaurs, painting]);

        await tags(wrapper)[0]!.trigger('click');

        expect(wrapper.emitted('update:selected')?.at(-1)?.[0]).toEqual([painting]);
    });

    it('reports plain records, without the flag the picker uses', async () => {
        const wrapper = await mountSelect();

        await tags(wrapper)[0]!.trigger('click');

        const reported = wrapper.emitted('update:selected')?.at(-1)?.[0] as InterestData[];
        expect(reported[0]).not.toHaveProperty('isSelected');
    });

    it('re-marks when a different child is loaded into it', async () => {
        const wrapper = await mountSelect([]);

        await wrapper.setProps({ selected: [dinosaurs] });
        await flushPromises();

        expect(selectedTags(wrapper).map((t: any) => t.text())).toEqual(['Dinosaurs']);
    });
});
