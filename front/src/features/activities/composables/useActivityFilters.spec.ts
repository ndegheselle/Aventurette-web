import { aBenefit, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BenefitData } from '@features/activities/model/benefit';
import { useActivityFilters } from './useActivityFilters';

const benefits = fakeCrud<BenefitData>();

// The feature reaches the backend through its api module and nothing else, so this one mock
// is the whole backend as far as this composable is concerned.
vi.mock('@features/activities/api/benefits.api', () => ({
    get benefitsApi() { return benefits; },
}));

const coordination = aBenefit({ name: 'Coordination' });
const attention = aBenefit({ name: 'Attention' });

beforeEach(() => {
    benefits.items = [coordination, attention];
});

function setup() {
    const onChange = vi.fn();
    const [filters, wrapper] = withSetup(() => useActivityFilters(onChange));
    return { filters, onChange, wrapper };
}

describe('useActivityFilters', () => {
    it('starts with nothing applied and no query sent', () => {
        const { filters, onChange } = setup();

        expect(filters.applied).toEqual({
            ageMin: null, ageMax: null, durationMin: null, durationMax: null,
            environment: [], benefits: [],
        });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('loads the benefits that can be filtered on', async () => {
        const { filters } = setup();

        await flushPromises();

        expect(filters.availableBenefits.value).toEqual([coordination, attention]);
    });

    it('applies a search without touching the criteria', () => {
        const { filters, onChange } = setup();

        filters.search.value = 'hunt';
        filters.apply();

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange.mock.lastCall?.[0].filters).toHaveLength(1);
    });

    describe('the advanced filters modal', () => {
        it('seeds its inputs from what is applied when it opens', () => {
            const { filters } = setup();
            filters.draft.ageMin = 99;

            filters.openDraft();

            expect(filters.draft.ageMin).toBeNull();
        });

        it('does not re-query while the draft is being edited', () => {
            const { filters, onChange } = setup();

            filters.openDraft();
            filters.draft.ageMin = 6;

            expect(onChange).not.toHaveBeenCalled();
            expect(filters.applied.ageMin).toBeNull();
        });

        it('adopts the draft and re-queries on confirm', () => {
            const { filters, onChange } = setup();

            filters.openDraft();
            filters.draft.ageMin = 6;
            filters.applyDraft();

            expect(filters.applied.ageMin).toBe(6);
            expect(onChange).toHaveBeenCalledOnce();
        });

        it('throws the draft away on cancel, leaving the list as it was', () => {
            const { filters, onChange } = setup();
            filters.openDraft();
            filters.draft.ageMin = 6;
            filters.applyDraft();
            onChange.mockClear();

            filters.openDraft();
            filters.draft.ageMin = 99;
            filters.discardDraft();

            expect(filters.draft.ageMin).toBe(6);
            expect(filters.applied.ageMin).toBe(6);
            expect(onChange).not.toHaveBeenCalled();
        });

        it('clears the inputs on reset, but leaves the list alone until confirm', () => {
            const { filters, onChange } = setup();
            filters.openDraft();
            filters.draft.ageMin = 6;
            filters.applyDraft();
            onChange.mockClear();

            filters.search.value = 'hunt';
            filters.resetDraft();

            expect(filters.draft.ageMin).toBeNull();
            expect(filters.search.value).toBe('');
            expect(filters.applied.ageMin).toBe(6);
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('benefit selection', () => {
        it('presents the selected ids as the records the tag input works in', async () => {
            const { filters } = setup();
            await flushPromises();

            filters.draft.benefits = [attention.id];

            expect(filters.draftBenefits.value).toEqual([attention]);
        });

        it('stores ids back when records are selected', async () => {
            const { filters } = setup();
            await flushPromises();

            filters.draftBenefits.value = [coordination, attention];

            expect(filters.draft.benefits).toEqual([coordination.id, attention.id]);
        });

        it('clears the selection when the tag input hands back nothing', async () => {
            const { filters } = setup();
            await flushPromises();
            filters.draft.benefits = [attention.id];

            filters.draftBenefits.value = [];

            expect(filters.draft.benefits).toEqual([]);
        });
    });

    describe('the filter button badge', () => {
        it('stays off for criteria the toolbar already shows', () => {
            const { filters } = setup();

            filters.openDraft();
            filters.draft.environment = ['INDOOR'];
            filters.applyDraft();

            expect(filters.showsAdvancedBadge.value).toBe(false);
        });

        it('comes on for a criterion hidden behind the modal', () => {
            const { filters } = setup();

            filters.openDraft();
            filters.draft.durationMax = 30;
            filters.applyDraft();

            expect(filters.showsAdvancedBadge.value).toBe(true);
        });
    });
});
