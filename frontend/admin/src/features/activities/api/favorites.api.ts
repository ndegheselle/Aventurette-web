import { crud } from '@/backend';
import { Collections } from '@/backend/schema.g';
import { favoritesMapper } from '@features/activities/api/favorites.mapper';
import type { ActivityData } from '@features/activities/models/activity';

// The favorites are a field of the user record. The `users` rules keep it to its owner.
const users = crud(Collections.Users, favoritesMapper);

export const favoritesApi = {
    /** The user's favorite activities, in the order they were added. */
    async of(userId: string): Promise<ActivityData[]> {
        const user = await users.getById(userId);
        return user?.favorites ?? [];
    },

    // One activity at a time, never the whole list: two hearts tapped at once both land.
    add: (userId: string, activityId: string) => users.link(userId, 'favorites', [activityId]),
    remove: (userId: string, activityId: string) => users.unlink(userId, 'favorites', [activityId]),
};
