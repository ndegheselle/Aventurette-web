import {
    activitiesMatchingAll,
    attributesFor,
    attributesWithOptions,
    AttributeType,
    formatAttributeValue,
    optionsBySubgroup,
} from '@features/activities/model/attribute';
import { anAttribute, anAttributeValue, anOption, aGroup } from '@tests';
import { describe, expect, it } from 'vitest';

// The catalogue's rules: what joins to what, what a group offers, and how the list works out
// which activities answered every criterion. A type alias or a plain lookup gets no test.

const t = (key: string, params: Record<string, unknown> = {}) =>
    `${key}(${Object.values(params).join('-')})`;

describe('attributesWithOptions', () => {
    it('hangs each option off the definition it names, in declared order', () => {
        const age = anAttribute({ id: 'atr-age', slug: 'age', sort_order: 2 });
        const domain = anAttribute({ id: 'atr-domain', slug: 'domaine', sort_order: 1 });
        const options = [
            anOption({ attribute: 'atr-domain', label: 'art', sort_order: 2 }),
            anOption({ attribute: 'atr-domain', label: 'cuisine', sort_order: 1 }),
        ];

        const joined = attributesWithOptions([age, domain], options);

        expect(joined.map(attribute => attribute.slug)).toEqual(['domaine', 'age']);
        expect(joined[0]!.options.map(option => option.label)).toEqual(['cuisine', 'art']);
        expect(joined[1]!.options).toEqual([]);
    });

    it('orders by group before sort_order, every group numbering from one', () => {
        const general = aGroup({ id: 'grp-gen', slug: 'general' });
        const social = aGroup({ id: 'grp-soc', slug: 'developpement-social' });
        const joined = attributesWithOptions([
            anAttribute({ slug: 'developpement-social', group: social.id, sort_order: 1 }),
            anAttribute({ slug: 'age', group: general.id, sort_order: 2 }),
            anAttribute({ slug: 'environnement', group: general.id, sort_order: 1 }),
        ], [], [general, social]);

        expect(joined.map(attribute => attribute.slug))
            .toEqual(['environnement', 'age', 'developpement-social']);
    });
});

describe('attributesFor', () => {
    const general = aGroup({ id: 'grp-gen', slug: 'general' });
    const social = aGroup({ id: 'grp-soc', slug: 'developpement-social' });
    const age = anAttribute({ group: general.id, slug: 'age' });
    const coop = anAttribute({ group: social.id, slug: 'developpement-social' });

    it('offers the selected group first, then the general attributes', () => {
        const offered = attributesFor([age, coop], [general, social], [social.id]);

        expect(offered.map(attribute => attribute.slug)).toEqual(['developpement-social', 'age']);
    });

    it('offers the general attributes alone when no group is selected', () => {
        expect(attributesFor([age, coop], [general, social], []).map(a => a.slug)).toEqual(['age']);
    });

    it('does not list the general group twice when it is the one selected', () => {
        expect(attributesFor([age, coop], [general, social], [general.id]).map(a => a.slug)).toEqual(['age']);
    });
});

describe('optionsBySubgroup', () => {
    it('keeps the families the Glossaire gives Imaginaire, in first-seen order', () => {
        const imaginaire = anAttribute({
            type: AttributeType.multi_choice,
            options: [
                anOption({ label: 'fées', subgroup: 'Fantastique' }),
                anOption({ label: 'pirates', subgroup: 'Aventure' }),
                anOption({ label: 'dragons', subgroup: 'Fantastique' }),
            ],
        });

        expect(optionsBySubgroup(imaginaire).map(family => [family.subgroup, family.options.length]))
            .toEqual([['Fantastique', 2], ['Aventure', 1]]);
    });

    it('gathers a vocabulary with no families under one empty key', () => {
        const domain = anAttribute({ options: [anOption({ label: 'art' }), anOption({ label: 'eau' })] });

        expect(optionsBySubgroup(domain)).toEqual([{ subgroup: '', options: domain.options }]);
    });
});

describe('formatAttributeValue', () => {
    it('reads a range as one bound or both', () => {
        const age = anAttribute({ type: AttributeType.range });

        expect(formatAttributeValue(t, age, anAttributeValue({ range_min: 6, range_max: 10 })))
            .toBe('activities.bounds.range(6-10)');
        expect(formatAttributeValue(t, age, anAttributeValue({ range_min: 6 })))
            .toBe('activities.bounds.minOnly(6)');
    });

    it('reads a single choice as the option it points at', () => {
        const chosen = anOption({ label: 'Au top', value: '3' });
        const energy = anAttribute({ type: AttributeType.single_choice, options: [chosen] });

        expect(formatAttributeValue(t, energy, anAttributeValue({ option: chosen.id }))).toBe('Au top');
    });

    it('reads the picks for a multi choice, which has no value row of its own', () => {
        const keywords = anAttribute({ type: AttributeType.multi_choice });
        const picked = [anOption({ label: 'art' }), anOption({ label: 'eau' })];

        expect(formatAttributeValue(t, keywords, undefined, picked)).toBe('art, eau');
    });

    it('is null when the activity holds nothing, so a badge is skipped rather than blank', () => {
        expect(formatAttributeValue(t, anAttribute({ type: AttributeType.number }), undefined)).toBeNull();
        expect(formatAttributeValue(t, anAttribute({ type: AttributeType.multi_choice }), undefined, [])).toBeNull();
    });
});

describe('activitiesMatchingAll', () => {
    // The backend answers the union of the criteria — a row can satisfy one and never two — so
    // the intersection is counted here, by distinct attribute.
    const rows = [
        { activity: 'act-1', attribute: 'atr-age' },
        { activity: 'act-1', attribute: 'atr-domain' },
        { activity: 'act-2', attribute: 'atr-age' },
    ];

    it('keeps only the activities that answered every criterion', () => {
        expect(activitiesMatchingAll(rows, 2)).toEqual(['act-1']);
    });

    it('keeps both when only one criterion was asked about', () => {
        expect(activitiesMatchingAll(rows, 1)).toEqual(['act-1', 'act-2']);
    });

    it('counts distinct attributes, so two rows of one attribute are still one answer', () => {
        const twice = [
            { activity: 'act-1', attribute: 'atr-domain' },
            { activity: 'act-1', attribute: 'atr-domain' },
        ];

        expect(activitiesMatchingAll(twice, 2)).toEqual([]);
    });

    it('matches nothing when nothing was asked, rather than everything', () => {
        expect(activitiesMatchingAll(rows, 0)).toEqual([]);
    });
});
