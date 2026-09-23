import type { ActivityData } from '@features/activities/model/activity';
import type { ReferentialData } from '@features/activities/model/referential';
import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import { aReferential, anActivity, fakeCrud, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The filter bar's wiring: the fields the criteria generate, the chips they raise and the query
// they send. What a criterion *is* is tested in `criteria.spec.ts`, and the translation to a
// query in `activity.filters.spec.ts`.

const activities = fakeCrud<ActivityData>();
const referentials = {
    fields: fakeCrud<ReferentialData>(),
    imaginary: fakeCrud<ReferentialData>(),
    security: fakeCrud<ReferentialData>(),
    develop_physical: fakeCrud<ReferentialData>(),
    develop_intellectual: fakeCrud<ReferentialData>(),
    develop_affect: fakeCrud<ReferentialData>(),
    develop_social: fakeCrud<ReferentialData>(),
    develop_moral: fakeCrud<ReferentialData>(),
    develop_spritual: fakeCrud<ReferentialData>(),
};

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities/api/referentials.api', () => ({
    get referentialsApi() { return referentials; },
}));

const art = aReferential({ id: 'fld-art', name: { fr: 'art', en: 'art' } });

beforeEach(() => {
    activities.items = [anActivity({ name: 'Treasure hunt' })];
    activities.lastFilter = null;
    for (const referential of Object.values(referentials)) referential.items = [];
    referentials.fields.items = [art];
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

/** The field for one criterion, found by the legend naming it. */
function field(wrapper: any, legend: string) {
    return wrapper.findAll('.fieldset > div')
        .find((candidate: any) => candidate.find('legend').text() === legend)!;
}

/** Narrow the list to playground activities, through the form rather than around it. */
async function filterByPlayground(wrapper: any) {
    await buttonSaying(wrapper, 'Filter')[0]!.trigger('click');
    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true);
    await wrapper.find('.modal-action .btn-primary').trigger('click');
    await flushPromises();
}

describe('<ActivitiesFilters>', () => {
    it('offers a field per criterion, named by the column it narrows', async () => {
        const wrapper = await mountPage();

        expect(wrapper.findAll('.fieldset legend').map(legend => legend.text())).toEqual([
            'Environment', 'Age', 'Children', 'Leaders', 'Domain', 'Imaginary world',
            'Season', 'Weather', 'Energy level', 'Safety',
            'Physical development', 'Intellectual development', 'Emotional development',
            'Social development', 'Moral development', 'Spiritual development',
        ]);
    });

    it('shows nothing above the list until something is applied', async () => {
        expect(chips(await mountPage())).toHaveLength(0);
    });

    it('shows a chip reading the values applied, not the criterion that holds them', async () => {
        const wrapper = await mountPage();

        await filterByPlayground(wrapper);

        expect(chips(wrapper).map((chip: any) => chip.text())).toEqual(['Playground']);
    });

    it('narrows the query to what was picked', async () => {
        const wrapper = await mountPage();

        await filterByPlayground(wrapper);

        expect(queried('environnement')).toEqual(['PARK']);
    });

    it('fills a referential in once its rows arrive, in the locale on screen', async () => {
        const wrapper = await mountPage();

        // The rows are loaded, not declared: the criterion is on screen before they answer.
        expect(wrapper.text()).toContain('art');
    });

    it('cuts a long vocabulary down and offers the rest behind a button', async () => {
        const wrapper = await mountPage();
        await buttonSaying(wrapper, 'Filter')[0]!.trigger('click');

        // Environment seeds fourteen; weather seeds four and is left whole.
        const environment = field(wrapper, 'Environment');
        expect(environment.findAll('input[type="checkbox"]')).toHaveLength(6);
        expect(environment.find('button').text()).toBe('Show 8 more');
        expect(field(wrapper, 'Weather').find('button').exists()).toBe(false);
    });

    it('shows the rest once the button is pressed, and hides them again', async () => {
        const wrapper = await mountPage();
        await buttonSaying(wrapper, 'Filter')[0]!.trigger('click');
        const environment = field(wrapper, 'Environment');

        await environment.find('button').trigger('click');

        expect(environment.findAll('input[type="checkbox"]')).toHaveLength(14);
        expect(environment.find('button').text()).toBe('Show less');

        await environment.find('button').trigger('click');

        expect(environment.findAll('input[type="checkbox"]')).toHaveLength(6);
    });

    it('reopens a collapsed vocabulary that is hiding something already applied', async () => {
        // A checkbox the user cannot reach reads as one they never ticked, and confirming the
        // form would clear a filter they could not see.
        const wrapper = await mountPage();
        const openModal = () => buttonSaying(wrapper, 'Filter')[0]!.trigger('click');
        const environment = () => field(wrapper, 'Environment');

        await openModal();
        await environment().find('button').trigger('click');
        await wrapper.findAll('input[type="checkbox"]')[13]!.setValue(true);
        await wrapper.find('.modal-action .btn-primary').trigger('click');
        await flushPromises();

        // Collapse it again and walk away, so nothing but the rule can reopen it.
        await openModal();
        await environment().find('button').trigger('click');
        expect(environment().findAll('input[type="checkbox"]')).toHaveLength(6);
        await wrapper.find('.modal-box .btn-circle').trigger('click');

        await openModal();

        const checkboxes = environment().findAll('input[type="checkbox"]');
        expect(checkboxes).toHaveLength(14);
        expect((checkboxes[13]!.element as HTMLInputElement).checked).toBe(true);
    });

    it('takes a criterion out of the query when its cross is clicked', async () => {
        const wrapper = await mountPage();
        await filterByPlayground(wrapper);

        await chips(wrapper)[0]!.find('button').trigger('click');
        await flushPromises();

        expect(chips(wrapper)).toHaveLength(0);
        expect(queried('environnement')).toBeUndefined();
    });
});
