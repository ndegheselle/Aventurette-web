import type { UsersResponse } from '@/backend/schema.g';
import { toEntities, toIds, type EntityMapper } from '@chapelure/core';
import { activityMapper, type ActivityPayload } from '@features/activities/api/activity.mapper';
import type { FavoritesData } from '@features/activities/models/favorites';

/** A user as the backend stores it, with their favorite activities expanded. */
export type FavoritesPayload = UsersResponse<{ favorites?: ActivityPayload[] }>;

/** Reads a user record for their favorites, each one a whole activity, and nothing else of it. */
export const favoritesMapper: EntityMapper<FavoritesPayload, FavoritesData> = {
    relations: [
        'favorites',
        ...activityMapper.relations.map(relation => `favorites.${relation}`),
    ],
    toEntity: (user, files) => ({
        id: user.id,
        favorites: toEntities(user.expand?.favorites, activityMapper, files),
    }),
    toPayload: ({ favorites }) => ({
        ...(favorites && { favorites: toIds(favorites) }),
    }),
};
