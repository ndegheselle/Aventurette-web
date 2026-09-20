import { catalogueOf, optionCount } from '@features/admin/model/catalogue';
import { aGroup, anAttribute, anOption } from '@tests';
import { describe, expect, it } from 'vitest';

// The one decision on this screen: what goes under which group, and what happens to a row that
// fits nowhere. An administration screen that hides a row is worse than one that looks untidy.

const general = aGroup({ id: 'grp-gen', name: 'Général', slug: 'general' });
const social = aGroup({ id: 'grp-soc', name: 'Développement social', slug: 'developpement-social' });

describe('catalogueOf', () => {
    it('lists every group with the attributes defined under it, in the order given', () => {
        const age = anAttribute({ group: general.id, slug: 'age' });
        const coop = anAttribute({ group: social.id, slug: 'developpement-social' });

        const catalogue = catalogueOf([general, social], [coop, age]);

        expect(catalogue.map(entry => [entry.group?.slug, entry.attributes.map(a => a.slug)]))
            .toEqual([['general', ['age']], ['developpement-social', ['developpement-social']]]);
    });

    it('lists a group that defines nothing, rather than leaving it out', () => {
        const catalogue = catalogueOf([general, social], [anAttribute({ group: general.id })]);

        expect(catalogue).toHaveLength(2);
        expect(catalogue[1]!.attributes).toEqual([]);
    });

    it('gathers an attribute whose group is missing at the end, rather than dropping it', () => {
        const orphan = anAttribute({ group: 'grp-gone', slug: 'orphelin' });

        const catalogue = catalogueOf([general], [anAttribute({ group: general.id }), orphan]);

        expect(catalogue[1]!.group).toBeNull();
        expect(catalogue[1]!.attributes.map(a => a.slug)).toEqual(['orphelin']);
    });

    it('adds no trailing entry when every attribute has its group', () => {
        const catalogue = catalogueOf([general], [anAttribute({ group: general.id })]);

        expect(catalogue.map(entry => entry.group)).toEqual([general]);
    });

    it('is the groups alone when the catalogue defines no attribute yet', () => {
        expect(catalogueOf([general], [])).toEqual([{ group: general, attributes: [] }]);
    });
});

describe('optionCount', () => {
    it('totals the vocabularies, which is the one number worth a line of its own', () => {
        const domain = anAttribute({ options: [anOption(), anOption()] });
        const age = anAttribute({ options: [] });

        expect(optionCount([domain, age])).toBe(2);
    });
});
