import type { ActivityData } from '@features/activities/model/activity';
import { AttributeType, type ActivityAttributeOptionData, type ActivityAttributeValueData, type AttributeDefinitionData, type AttributeOptionData, type GroupData } from '@features/activities/model/attribute';
import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import { aGroup, anActivity, anOption, fakeCrud, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The filter bar's wiring, and the one thing this screen does that no other does: the fields are
// generated from the catalogue rather than declared, so seeding an attribute puts a filter on
// screen. What a criterion *is* is tested in `criteria.spec.ts`, and the queries in
// `activity.filters.spec.ts`.

const activities = fakeCrud<ActivityData>();
const groups = fakeCrud<GroupData>();
const definitions = fakeCrud<AttributeDefinitionData>();
const options = fakeCrud<AttributeOptionData>();
const values = fakeCrud<ActivityAttributeValueData>();
const picks = fakeCrud<ActivityAttributeOptionData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities/api/attributes.api', () => ({
    get groupsApi() { return groups; },
    get attributeDefinitionsApi() { return definitions; },
    get attributeOptionsApi() { return options; },
    get activityAttributeValuesApi() { return values; },
    get activityAttributeOptionsApi() { return picks; },
}));

const general = aGroup({ id: 'grp-gen', name: 'Général', slug: 'general' });
const energyOption = anOption({ id: 'opt-low', attribute: 'atr-nrg', label: 'Bas', value: '1' });

beforeEach(() => {
    activities.items = [anActivity({ name: 'Treasure hunt' })];
    activities.lastFilter = null;
    groups.items = [general];
    options.items = [energyOption];
    values.items = [];
    picks.items = [];
    definitions.items = [
        { ...anOption(), id: 'atr-age', group: general.id, name: 'Âge recommandé', slug: 'age', type: AttributeType.range, filterable: true, sort_order: 1 } as any,
        { ...anOption(), id: 'atr-nrg', group: general.id, name: "Niveau d'énergie", slug: 'niveau-energie', type: AttributeType.single_choice, filterable: true, sort_order: 2 } as any,
        { ...anOption(), id: 'atr-vis', group: general.id, name: 'Visuel principal', slug: 'visuel-principal', type: AttributeType.string, filterable: false, sort_order: 3 } as any,
    ];
});

async function mountPage() {
    const { wrapper } = await mountWithRouter(ActivitiesPage);
    await flushPromises();
    return wrapper;
}

const chips = (wrapper: any) => wrapper.findAll('.badge-lg');
const buttonSaying = (wrapper: any, label: string) =>
    wrapper.findAll('button').filter((button: any) => button.text() === label);

/** What the last query narrowed a field to, or undefined if it did not. */
function queried(key: string): unknown {
    const flatten = (group: any): any[] =>
        group.filters.flatMap((filter: any) => 'filters' in filter ? flatten(filter) : [filter]);

    return flatten(activities.lastFilter!).find(filter => filter.key === key)?.value;
}

/** Narrow the list to low-energy activities, through the form rather than around it. */
async function filterByLowEnergy(wrapper: any) {
    await buttonSaying(wrapper, 'Filter')[0]!.trigger('click');
    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true);
    await wrapper.find('.modal-action .btn-primary').trigger('click');
    await flushPromises();
}

describe('<ActivitiesFilters>', () => {
    it('generates a field per filterable attribute, so seeding one needs no markup', async () => {
        const wrapper = await mountPage();

        // Groups first — a field of the activity — then the catalogue's own, in sort order.
        // `Visuel principal` is not filterable and gets none.
        expect(wrapper.findAll('.fieldset legend').map(legend => legend.text()))
            .toEqual(['Groups', 'Âge recommandé', "Niveau d'énergie"]);
    });

    it('shows nothing above the list until something is applied', async () => {
        expect(chips(await mountPage())).toHaveLength(0);
    });

    it('shows a chip for what was applied, reading the values and not the criterion', async () => {
        const wrapper = await mountPage();

        await filterByLowEnergy(wrapper);

        expect(chips(wrapper).map((chip: any) => chip.text())).toEqual(['Bas']);
    });

    it('sweeps the attribute rows, then narrows the activities to what matched them all', async () => {
        values.items = [
            { ...anOption(), id: 'val-1', activity: 'act-match', attribute: 'atr-nrg' } as any,
        ];
        const wrapper = await mountPage();

        await filterByLowEnergy(wrapper);

        expect(queried('id')).toEqual(['act-match']);
    });

    it('does not query at all when the sweep matched nothing, rather than showing everything', async () => {
        const wrapper = await mountPage();
        activities.lastFilter = null;

        await filterByLowEnergy(wrapper);

        expect(activities.lastFilter).toBeNull();
    });

    it('takes a criterion out of the query when its cross is clicked', async () => {
        const wrapper = await mountPage();
        await filterByLowEnergy(wrapper);

        await chips(wrapper)[0]!.find('button').trigger('click');
        await flushPromises();

        expect(chips(wrapper)).toHaveLength(0);
        expect(queried('id')).toBeUndefined();
    });
});
