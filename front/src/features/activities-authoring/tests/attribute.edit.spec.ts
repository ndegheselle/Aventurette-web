import { AttributeType } from '@features/activities/model/attribute';
import { attributeDrafts, attributeWrites } from '@features/activities-authoring/model/attribute.edit';
import { anActivity, anAttribute, anAttributeValue, anOption, aPick } from '@tests';
import { describe, expect, it } from 'vitest';

// What the save has to write, worked out before anything is sent. The decision in here is which
// rows are new, which changed and which the user emptied — a blank field deletes a row, it does
// not blank one, because the unique index means the row's absence *is* the empty value.

const age = anAttribute({ id: 'atr-age', slug: 'age', type: AttributeType.range });
const art = anOption({ label: 'art' });
const eau = anOption({ label: 'eau' });
const domain = anAttribute({
    id: 'atr-dom', slug: 'domaine', type: AttributeType.multi_choice, options: [art, eau],
});

describe('attributeDrafts', () => {
    it('seeds a draft per attribute from what the activity holds', () => {
        const activity = anActivity({
            attributes: [anAttributeValue({ attribute: age.id, range_min: 6, range_max: 10 })],
            picks: [aPick({ attribute: domain.id, option: art.id })],
        });

        const [ageDraft, domainDraft] = attributeDrafts([age, domain], activity);

        expect([ageDraft!.min, ageDraft!.max]).toEqual([6, 10]);
        expect(domainDraft!.options).toEqual([art.id]);
    });

    it('seeds an attribute the activity says nothing about as empty', () => {
        const [draft] = attributeDrafts([age], anActivity());

        expect([draft!.min, draft!.max, draft!.options]).toEqual([null, null, []]);
    });
});

describe('attributeWrites', () => {
    it('creates a row for an attribute the activity did not hold', () => {
        const activity = anActivity({ id: 'act-1' });
        const drafts = attributeDrafts([age], activity);
        drafts[0]!.min = 6;

        const writes = attributeWrites(drafts, activity);

        expect(writes.created).toEqual([
            { activity: 'act-1', attribute: age.id, range_min: 6, range_max: undefined },
        ]);
        expect(writes.updated).toEqual([]);
    });

    it('updates the row it already had, rather than writing a second one', () => {
        const held = anAttributeValue({ id: 'val-1', attribute: age.id, range_min: 6, range_max: 10 });
        const activity = anActivity({ attributes: [held] });
        const drafts = attributeDrafts([age], activity);
        drafts[0]!.max = 12;

        const writes = attributeWrites(drafts, activity);

        expect(writes.updated).toEqual([{ id: 'val-1', fields: { range_min: 6, range_max: 12 } }]);
        expect(writes.created).toEqual([]);
    });

    it('removes the row when the user empties the field, rather than blanking it', () => {
        const held = anAttributeValue({ id: 'val-1', attribute: age.id, range_min: 6 });
        const activity = anActivity({ attributes: [held] });
        const drafts = attributeDrafts([age], activity);
        drafts[0]!.min = null;

        const writes = attributeWrites(drafts, activity);

        expect(writes.removed).toEqual(['val-1']);
        expect(writes.updated).toEqual([]);
    });

    it('treats a cleared input as empty, an emptied number field binding as a string', () => {
        const held = anAttributeValue({ id: 'val-1', attribute: age.id, range_min: 6 });
        const activity = anActivity({ attributes: [held] });
        const drafts = attributeDrafts([age], activity);
        drafts[0]!.min = '' as never;

        expect(attributeWrites(drafts, activity).removed).toEqual(['val-1']);
    });

    it('keeps a zero, which is a bound someone may mean and not an empty field', () => {
        const held = anAttributeValue({ id: 'val-1', attribute: age.id, range_min: 0, range_max: 10 });
        const activity = anActivity({ attributes: [held] });

        const writes = attributeWrites(attributeDrafts([age], activity), activity);

        expect(writes.removed).toEqual([]);
        expect(writes.updated).toEqual([{ id: 'val-1', fields: { range_min: 0, range_max: 10 } }]);
    });

    it('writes nothing at all for an attribute that was empty and stayed empty', () => {
        const activity = anActivity();

        expect(attributeWrites(attributeDrafts([age, domain], activity), activity))
            .toEqual({ created: [], updated: [], removed: [], picked: [], unpicked: [] });
    });

    it('adds and drops the picks a multi choice gained and lost, and touches no value row', () => {
        const activity = anActivity({
            id: 'act-1',
            picks: [aPick({ id: 'pck-1', attribute: domain.id, option: art.id })],
        });
        const drafts = attributeDrafts([domain], activity);
        drafts[0]!.options = [eau.id];

        const writes = attributeWrites(drafts, activity);

        expect(writes.picked).toEqual([{ activity: 'act-1', attribute: domain.id, option: eau.id }]);
        expect(writes.unpicked).toEqual(['pck-1']);
        expect(writes.created).toEqual([]);
    });

    it('leaves a pick the activity already had alone, so saving twice writes once', () => {
        const activity = anActivity({
            picks: [aPick({ id: 'pck-1', attribute: domain.id, option: art.id })],
        });

        const writes = attributeWrites(attributeDrafts([domain], activity), activity);

        expect([writes.picked, writes.unpicked]).toEqual([[], []]);
    });
});
