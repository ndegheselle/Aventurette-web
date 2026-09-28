import { ActivityTagType, groupTagsByType, translated, type ActivityTagData } from '@features/activities/model/tag';
import { aTag } from '@tests';
import { describe, expect, it } from 'vitest';

describe('translated', () => {
    it('reads the wording in the locale asked for', () => {
        expect(translated({ fr: 'forêt', en: 'forest' }, 'en')).toBe('forest');
    });

    it('falls back to another wording rather than showing nothing', () => {
        expect(translated({ fr: 'forêt' }, 'en')).toBe('forêt');
        expect(translated({ fr: 'forêt', en: '' }, 'en')).toBe('forêt');
    });

    it('is empty for a column with no wording at all', () => {
        expect(translated(null, 'fr')).toBe('');
        expect(translated({}, 'fr')).toBe('');
    });
});

describe('groupTagsByType', () => {
    it('groups tags by kind, in the order the kinds are declared rather than the order they arrive', () => {
        const groups = groupTagsByType([
            aTag({ type: ActivityTagType.SECURITY }),
            aTag({ type: ActivityTagType.FIELD }),
            aTag({ type: ActivityTagType.SECURITY }),
        ], 'fr');

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.FIELD, ActivityTagType.SECURITY]);
        expect(groups[1]!.tags).toHaveLength(2);
    });

    it('leaves out a kind with no tag, so no empty heading shows', () => {
        const groups = groupTagsByType([aTag({ type: ActivityTagType.IMAGINARY })], 'fr');

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.IMAGINARY]);
    });

    it('keeps a kind the enum does not know yet, after the known ones', () => {
        const unknown = 'DEVELOP_ARTISTIC' as ActivityTagData['type'];
        const groups = groupTagsByType([aTag({ type: unknown }), aTag({ type: ActivityTagType.FIELD })], 'fr');

        expect(groups.map(group => group.type)).toEqual([ActivityTagType.FIELD, unknown]);
    });

    it('sorts a kind by its wording in the locale shown', () => {
        const tags = [
            aTag({ name: { fr: 'forêt', en: 'forest' } }),
            aTag({ name: { fr: 'art', en: 'visual arts' } }),
            aTag({ name: { fr: 'ingénierie', en: 'engineering' } }),
        ];

        const names = (locale: string) =>
            groupTagsByType(tags, locale)[0]!.tags.map(tag => translated(tag.name, locale));

        expect(names('fr')).toEqual(['art', 'forêt', 'ingénierie']);
        expect(names('en')).toEqual(['engineering', 'forest', 'visual arts']);
    });
});
