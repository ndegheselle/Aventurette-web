import type { ActivityData, BenefitData } from '@features/activities/model/activity';
import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import { aBenefit, anActivity, fakeCrud, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The filter bar's wiring, which is what mounting is for: a form generated from the criteria, a
 * chip per criterion the user set, and a cross that takes one back out of the query. What each
 * of those *decides* is tested without a screen in `criteria.spec.ts`.
 */

const activities = fakeCrud<ActivityData>();
const benefits = fakeCrud<BenefitData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
    get benefitsApi() { return benefits; },
}));

beforeEach(() => {
    activities.items = [anActivity({ name: 'Treasure hunt' })];
    activities.lastFilter = null;
    benefits.items = [aBenefit({ name: 'Coordination' })];
});

async function mountPage() {
    const { wrapper } = await mountWithRouter(ActivitiesPage);
    await flushPromises();
    return wrapper;
}

const chips = (wrapper: any) => wrapper.findAll('.badge-lg');
const buttonSaying = (wrapper: any, label: string) =>
    wrapper.findAll('button').filter((button: any) => button.text() === label);

/** What the last query narrowed a field to, or undefined if it did not narrow it at all. */
function queried(key: string): unknown {
    const flatten = (group: any): any[] =>
        group.filters.flatMap((filter: any) => 'filters' in filter ? flatten(filter) : [filter]);

    return flatten(activities.lastFilter!).find(filter => filter.key === key)?.value;
}

/** Narrow the list to indoor activities, through the form rather than around it. */
async function filterByIndoors(wrapper: any) {
    await buttonSaying(wrapper, 'Filter')[0]!.trigger('click');
    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true);
    await wrapper.find('.modal-action .btn-primary').trigger('click');
    await flushPromises();
}

describe('<ActivitiesFilters>', () => {
    it('generates a field per criterion, so a new one needs no markup of its own', async () => {
        const wrapper = await mountPage();

        expect(wrapper.findAll('.fieldset legend').map(legend => legend.text()))
            .toEqual(['Age', 'Duration (minutes)', 'Environment', 'Benefits']);
    });

    it('shows nothing above the list until something is applied', async () => {
        expect(chips(await mountPage())).toHaveLength(0);
    });

    it('shows a chip for what was applied, reading the values and not the criterion', async () => {
        const wrapper = await mountPage();

        await filterByIndoors(wrapper);

        expect(chips(wrapper).map((chip: any) => chip.text())).toEqual(['Indoors']);
        expect(queried('environment')).toEqual(['INDOOR']);
    });

    it('takes a criterion out of the query when its cross is clicked', async () => {
        const wrapper = await mountPage();
        await filterByIndoors(wrapper);

        await chips(wrapper)[0]!.find('button').trigger('click');
        await flushPromises();

        expect(chips(wrapper)).toHaveLength(0);
        expect(queried('environment')).toBeUndefined();
    });
});
