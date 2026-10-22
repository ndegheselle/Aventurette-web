import { activityMapper } from '@features/activities/api/activity.mapper';
import { favoritesMapper, type FavoritesPayload } from '@features/activities/api/favorites.mapper';
import { withFavorite } from '@features/activities/models/favorites';
import { anActivity, anActivityPayload, aUser, fakeFileUrls } from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('favoritesMapper', () => {
    it('asks for each favorite whole, with every relation an activity needs', () => {
        expect(favoritesMapper.relations).toEqual([
            'favorites',
            ...activityMapper.relations.map(relation => `favorites.${relation}`),
        ]);
    });

    it('reads the favorites as activities, in their stored order, and nothing else of the user', () => {
        const user = {
            ...aUser({ id: 'usr-1' }),
            favorites: ['act-2', 'act-1'],
            expand: { favorites: [anActivityPayload({ id: 'act-2' }), anActivityPayload({ id: 'act-1' })] },
        } as FavoritesPayload;

        const read = favoritesMapper.toEntity(user, files);

        expect(Object.keys(read)).toEqual(['id', 'favorites']);
        expect(read.favorites.map(activity => activity.id)).toEqual(['act-2', 'act-1']);
    });

    it('reads unexpanded favorites as none rather than as ids', () => {
        const user = { ...aUser(), favorites: ['act-1'] } as FavoritesPayload;

        expect(favoritesMapper.toEntity(user, files).favorites).toEqual([]);
    });
});

describe('withFavorite', () => {
    it('keeps an activity once when it is added twice', () => {
        const hunt = anActivity({ id: 'act-1' });

        expect(withFavorite([hunt], hunt)).toEqual([hunt]);
    });
});
