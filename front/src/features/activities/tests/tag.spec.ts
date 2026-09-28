import { ActivityTagType, groupTagsByType, type ActivityTagData } from '@features/activities/model/tag';
import { aTag } from '@tests';
import { describe, expect, it } from 'vitest';

describe('groupTagsByType', () => {
    it('groups tags by kind, in the order the kinds are declared rather than the order they arrive', () => {
        const groups = groupTagsByType([
            aTag({ type: ActivityTagType.SECURITY }),
            aTag({ type: ActivityTagType.FIELD }),
            aTag({ type: ActivityTagType.SECURITY }),
        ]);

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.FIELD, ActivityTagType.SECURITY]);
        expect(groups[1]!.tags).toHaveLength(2);
    });

    it('leaves out a kind with no tag, so no empty heading shows', () => {
        const groups = groupTagsByType([aTag({ type: ActivityTagType.IMAGINARY })]);

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.IMAGINARY]);
    });

    it('keeps a kind the enum does not know yet, after the known ones', () => {
        const unknown = 'DEVELOP_ARTISTIC' as ActivityTagData['type'];
        const groups = groupTagsByType([aTag({ type: unknown }), aTag({ type: ActivityTagType.FIELD })]);

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.FIELD, unknown]);
    });

    it('sorts a kind by name', () => {
        const tags = [aTag({ name: 'forêt' }), aTag({ name: 'art' }), aTag({ name: 'ingénierie' })];

        expect(groupTagsByType(tags)[0]!.tags.map(tag => tag.name)).toEqual(['art', 'forêt', 'ingénierie']);
    });
});
