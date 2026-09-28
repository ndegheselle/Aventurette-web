import { ActivityTagType, tagOptions, type ActivityTagData } from '@features/activities/model/tag';
import { aTag } from '@tests';
import { describe, expect, it } from 'vitest';

describe('tagOptions', () => {
    it('groups tags by kind, whatever order they arrive in', () => {
        const options = tagOptions([
            aTag({ type: ActivityTagType.SECURITY }),
            aTag({ type: ActivityTagType.THEME }),
            aTag({ type: ActivityTagType.SECURITY }),
        ]);

        expect(options.SECURITY).toHaveLength(2);
        expect(options.THEME).toHaveLength(1);
    });

    it('has an empty list for a kind with no tag, so every picker can read its own', () => {
        const options = tagOptions([aTag({ type: ActivityTagType.IMAGINARY })]);

        expect(options.GOAL).toEqual([]);
        expect(Object.keys(options)).toEqual(Object.values(ActivityTagType));
    });

    it('keeps a kind the enum does not know yet rather than dropping its tags', () => {
        const unknown = 'DEVELOP_ARTISTIC' as ActivityTagData['type'];

        expect(tagOptions([aTag({ type: unknown })])[unknown]).toHaveLength(1);
    });

    it('sorts a kind by name', () => {
        const tags = [aTag({ name: 'forêt' }), aTag({ name: 'art' }), aTag({ name: 'ingénierie' })];

        expect(tagOptions(tags).THEME.map(tag => tag.name)).toEqual(['art', 'forêt', 'ingénierie']);
    });
});
